// Browser-only stand-in for the Express API, used automatically when the
// backend is not running so the whole site stays clickable as a demo.
// It mirrors the server routes and stores users/bookings in localStorage.
import * as data from '../data.js';
import { quote, applyCoupon, totals, nightsBetween } from '../pricing.js';
import { buildStats } from '../stats.js';

const KEY = 'ss-demo-db';
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};
const db = { users: [], bookings: [], reviews: [], messages: [], catalog: {}, hiddenReviews: [], ...load() };
const SEED_USERS = [
  { _id: 'u-demo', name: 'Demo Guest', email: 'demo@sagarashores.in', phone: '+91 90000 00000', city: 'Chennai', role: 'guest', password: 'demo123' },
  { _id: 'u-admin', name: 'Resort Admin', email: 'admin@sagarashores.in', phone: '+91 98765 43210', city: 'Kanyakumari', role: 'admin', password: 'admin123' },
];
for (const u of SEED_USERS) {
  if (!db.users.some((x) => x.email === u.email)) db.users.push({ ...u, createdAt: new Date().toISOString() });
}
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch { /* storage unavailable — keep in memory */ }
};

class MockError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// Catalogue edited from the admin panel overrides the bundled data per collection.
const EDITABLE = ['rooms', 'menu', 'packages', 'offers', 'vehicles'];
const cat = (key) => db.catalog[key] || data[key];
const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const publicUser = ({ password, ...u }) => ({ role: 'guest', ...u });
const userFromToken = (token) => {
  const user = token && db.users.find((u) => `mock:${u._id}` === token);
  if (!user) throw new MockError('Please log in to continue', 401);
  return user;
};
const requireAdmin = (token) => {
  const user = userFromToken(token);
  if (user.role !== 'admin') throw new MockError('Admins only', 403);
  return user;
};
const withUser = (b) => {
  const u = db.users.find((x) => x._id === b.user);
  return { ...b, user: u ? { _id: u._id, name: u.name, email: u.email, phone: u.phone } : null };
};
const catalog = () => ({ rooms: cat('rooms'), menu: cat('menu'), packages: cat('packages'), vehicles: cat('vehicles'), transportServices: data.transportServices });
const findOffer = (code) => cat('offers').find((o) => o.code === String(code || '').toUpperCase());
const editable = (name) => {
  if (!EDITABLE.includes(name)) throw new MockError('Unknown collection', 404);
  return name;
};

function roomsLeft(room, checkIn, checkOut) {
  const booked = db.bookings
    .filter((b) => b.type === 'room' && b.status !== 'cancelled' && b.details.roomId === room._id && b.details.checkIn < checkOut && b.details.checkOut > checkIn)
    .reduce((s, b) => s + (Number(b.details.rooms) || 1), 0);
  return Math.max(0, room.totalUnits - booked);
}

const routes = [
  ['GET', /^\/rooms$/, () => cat('rooms')],
  ['GET', /^\/menu$/, () => cat('menu')],
  ['GET', /^\/packages$/, () => cat('packages')],
  ['GET', /^\/vehicles$/, () => cat('vehicles')],
  ['GET', /^\/transport$/, () => data.transportServices],
  ['GET', /^\/offers$/, () => cat('offers')],
  ['GET', /^\/gallery$/, () => data.gallery],
  ['GET', /^\/reviews$/, () => [...db.reviews, ...data.reviews].filter((r) => !db.hiddenReviews.includes(r._id))],
  ['GET', /^\/rooms\/([\w-]+)\/availability\?(.*)$/, ({ match }) => {
    const room = cat('rooms').find((r) => r._id === match[1]);
    if (!room) throw new MockError('Room not found', 404);
    const q = new URLSearchParams(match[2]);
    if (nightsBetween(q.get('checkIn'), q.get('checkOut')) < 1) throw new MockError('Check-out must be after check-in');
    const left = roomsLeft(room, q.get('checkIn'), q.get('checkOut'));
    return { available: left > 0, roomsLeft: left };
  }],
  ['POST', /^\/auth\/register$/, ({ body }) => {
    if (!body.name || !body.email || !body.password) throw new MockError('Name, email and password are required');
    if (body.password.length < 6) throw new MockError('Password must be at least 6 characters');
    const email = body.email.toLowerCase();
    if (db.users.some((u) => u.email === email)) throw new MockError('An account with this email already exists', 409);
    const user = { _id: `u-${Date.now()}`, name: body.name, email, phone: body.phone, role: 'guest', password: body.password, createdAt: new Date().toISOString() };
    db.users.push(user);
    save();
    return { token: `mock:${user._id}`, user: publicUser(user) };
  }],
  ['POST', /^\/auth\/login$/, ({ body }) => {
    const user = db.users.find((u) => u.email === String(body.email).toLowerCase() && u.password === body.password);
    if (!user) throw new MockError('Incorrect email or password', 401);
    return { token: `mock:${user._id}`, user: publicUser(user) };
  }],
  ['GET', /^\/auth\/me$/, ({ token }) => publicUser(userFromToken(token))],
  ['PUT', /^\/auth\/me$/, ({ token, body }) => {
    const user = userFromToken(token);
    Object.assign(user, { name: body.name || user.name, phone: body.phone, city: body.city });
    save();
    return publicUser(user);
  }],
  ['POST', /^\/coupons\/validate$/, ({ body }) => {
    const result = applyCoupon(findOffer(body.code), body.category, Number(body.amount) || 0);
    if (!result.ok) throw new MockError(result.message);
    return result;
  }],
  ['POST', /^\/bookings$/, ({ token, body }) => {
    const user = userFromToken(token);
    const details = { ...body.details };
    const q = quote(body.type, details, catalog());
    let discount = 0;
    let coupon;
    if (body.coupon) {
      const offer = findOffer(body.coupon);
      const r = applyCoupon(offer, body.type, q.subtotal);
      if (!r.ok) throw new MockError(r.message);
      discount = r.discount;
      coupon = offer.code;
    }
    if (body.type === 'room') {
      const room = cat('rooms').find((r) => r._id === details.roomId);
      const left = roomsLeft(room, details.checkIn, details.checkOut);
      if (left < (Number(details.rooms) || 1)) throw new MockError(`Only ${left} ${room.name} left for those dates`, 409);
    }
    const now = new Date();
    const booking = {
      _id: `b-${now.getTime()}`, user: user._id, type: body.type, details, title: q.title, image: q.image,
      ...totals(q.subtotal, discount), coupon, status: 'confirmed',
      payment: { method: body.paymentMethod || 'upi', status: 'paid', txnId: `TXN${now.getTime().toString(36).toUpperCase()}`, paidAt: now.toISOString() },
      invoiceNo: `SS-${now.getFullYear()}-${String(db.bookings.length + 1001).padStart(5, '0')}`,
      createdAt: now.toISOString(),
    };
    db.bookings.unshift(booking);
    save();
    return booking;
  }],
  ['GET', /^\/bookings\/mine$/, ({ token }) => {
    const user = userFromToken(token);
    return db.bookings.filter((b) => b.user === user._id);
  }],
  ['PATCH', /^\/bookings\/([\w-]+)\/cancel$/, ({ token, match }) => {
    const user = userFromToken(token);
    const b = db.bookings.find((x) => x._id === match[1] && x.user === user._id);
    if (!b) throw new MockError('Booking not found', 404);
    b.status = 'cancelled';
    b.payment.status = 'refunded';
    save();
    return b;
  }],
  ['POST', /^\/reviews$/, ({ token, body }) => {
    const user = userFromToken(token);
    if (!body.rating || !body.text) throw new MockError('Rating and review text are required');
    const review = { _id: `r-${Date.now()}`, name: user.name, city: user.city, rating: body.rating, title: body.title, text: body.text, stay: body.stay, photos: (body.photos || []).slice(0, 4), date: new Date().toISOString().slice(0, 10), verified: true };
    db.reviews.unshift(review);
    save();
    return review;
  }],
  ['POST', /^\/contact$/, ({ body }) => {
    if (!body.name || !body.email || !body.message) throw new MockError('Please fill in name, email and message');
    db.messages.unshift({ _id: `m-${Date.now()}`, name: body.name, email: body.email, phone: body.phone, message: body.message, createdAt: new Date().toISOString() });
    save();
    return { message: 'Thanks! Our team will get back to you within a few hours.' };
  }],

  // ---- Admin ----
  ['GET', /^\/admin\/stats$/, ({ token }) => {
    requireAdmin(token);
    const reviews = db.reviews.length + data.reviews.length - db.hiddenReviews.length;
    return buildStats(db.bookings, { users: db.users.length, messages: db.messages.length, reviews });
  }],
  ['GET', /^\/admin\/bookings$/, ({ token }) => {
    requireAdmin(token);
    return db.bookings.map(withUser);
  }],
  ['PATCH', /^\/admin\/bookings\/([\w-]+)$/, ({ token, match, body }) => {
    requireAdmin(token);
    if (!['confirmed', 'completed', 'cancelled'].includes(body.status)) throw new MockError('Invalid status');
    const b = db.bookings.find((x) => x._id === match[1]);
    if (!b) throw new MockError('Booking not found', 404);
    b.status = body.status;
    if (body.status === 'cancelled') b.payment.status = 'refunded';
    save();
    return withUser(b);
  }],
  ['GET', /^\/admin\/users$/, ({ token }) => {
    requireAdmin(token);
    return db.users.map((u) => {
      const mine = db.bookings.filter((b) => b.user === u._id && b.status !== 'cancelled');
      return { ...publicUser(u), bookings: mine.length, spent: mine.reduce((s, b) => s + b.total, 0) };
    });
  }],
  ['GET', /^\/admin\/messages$/, ({ token }) => {
    requireAdmin(token);
    return db.messages;
  }],
  ['DELETE', /^\/admin\/messages\/([\w-]+)$/, ({ token, match }) => {
    requireAdmin(token);
    db.messages = db.messages.filter((m) => m._id !== match[1]);
    save();
    return { ok: true };
  }],
  ['DELETE', /^\/admin\/reviews\/([\w-]+)$/, ({ token, match }) => {
    requireAdmin(token);
    db.reviews = db.reviews.filter((r) => r._id !== match[1]);
    db.hiddenReviews.push(match[1]);
    save();
    return { ok: true };
  }],
  ['POST', /^\/admin\/(\w+)$/, ({ token, match, body }) => {
    requireAdmin(token);
    const key = editable(match[1]);
    const _id = slug(body._id || body.code || body.name);
    if (!_id) throw new MockError('Name is required');
    if (cat(key).some((x) => x._id === _id)) throw new MockError(`“${_id}” already exists`, 409);
    const doc = { ...body, _id };
    db.catalog[key] = [...cat(key), doc];
    save();
    return doc;
  }],
  ['PUT', /^\/admin\/(\w+)\/([\w-]+)$/, ({ token, match, body }) => {
    requireAdmin(token);
    const key = editable(match[1]);
    const { _id, ...fields } = body;
    let updated;
    db.catalog[key] = cat(key).map((x) => (x._id === match[2] ? (updated = { ...x, ...fields }) : x));
    if (!updated) throw new MockError('Not found', 404);
    save();
    return updated;
  }],
  ['DELETE', /^\/admin\/(\w+)\/([\w-]+)$/, ({ token, match }) => {
    requireAdmin(token);
    const key = editable(match[1]);
    db.catalog[key] = cat(key).filter((x) => x._id !== match[2]);
    save();
    return { ok: true };
  }],
];

export async function mockRequest(path, { method = 'GET', body, token } = {}) {
  await new Promise((r) => setTimeout(r, 250)); // feel like a network call
  for (const [m, re, handler] of routes) {
    const match = m === method && path.match(re);
    if (match) return structuredClone(handler({ match, body: body || {}, token }));
  }
  throw new MockError('Not found', 404);
}
