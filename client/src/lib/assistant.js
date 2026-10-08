// Lightweight intent engine for the concierge chatbot. It extracts guests,
// nights, budget and intents from free text (English + common Tanglish) and
// returns a reply with bookable suggestions built from live catalogue data.
import { addDays, inr, today } from '@shared/lib/format.js';

const WORD_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, rendu: 2, moonu: 3, naalu: 4, oru: 1, anju: 5 };
const num = (s) => (/^\d+$/.test(s) ? Number(s) : WORD_NUM[s]);
const N = '(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|oru|rendu|moonu|naalu|anju)';

const INTENTS = {
  room: /\b(room|rooms|stay|villa|suite|cottage|accommodation|bed|night|nights|book|thangu|thanga)\b/,
  tour: /\b(sightseeing|sight seeing|tour|tours|package|packages|trip|visit|places|itinerary|suthi|backwater|waterfall|falls|temple|munnar|madurai|rameswaram|kerala|kovalam|courtallam|suchindram)\b/,
  food: /\b(food|menu|eat|hungry|dinner|lunch|breakfast|restaurant|biryani|dosa|idli|seafood|fish|saapadu|sapadu|order)\b/,
  cab: /\b(cab|taxi|car|pickup|pick up|drop|airport|railway|station|train|flight|transport|vehicle)\b/,
  offers: /\b(offer|offers|discount|coupon|deal|deals|promo|cheap)\b/,
  timing: /\b(check.?in|check.?out|timing|timings|time)\b/,
  contact: /\b(contact|phone|call|whatsapp|email|address|location|where|map|reach)\b/,
  greet: /^(hi|hello|hey|vanakkam|hai|good (morning|evening|afternoon))\b/,
  thanks: /\b(thanks|thank you|nandri|super|great)\b/,
};

export function parse(text) {
  const t = ` ${text.toLowerCase().replace(/[.,!?]/g, ' ')} `;
  const intents = Object.keys(INTENTS).filter((k) => INTENTS[k].test(t));

  let guests;
  const g = t.match(new RegExp(`${N}\\s*(people|persons|person|pax|guests|guest|adults|adult|members|peru|per)\\b`));
  if (g) guests = num(g[1]);
  else if (/\b(couple|wife|husband|honeymoon|anniversary)\b/.test(t)) guests = 2;
  else if (/\bfamily\b/.test(t)) guests = 4;
  else if (/\b(solo|alone|myself)\b/.test(t)) guests = 1;

  let nights;
  const n = t.match(new RegExp(`${N}\\s*(nights?|naal|days?)\\b`));
  if (n) nights = num(n[1]);
  if (/\bweekend\b/.test(t)) nights = nights || 2;

  const budgetMatch = t.match(/(?:under|below|less than|within|budget)\s*(?:rs\.?|₹|inr)?\s*(\d[\d,]*)/);
  const budget = budgetMatch ? Number(budgetMatch[1].replace(/,/g, '')) : undefined;

  let checkIn = addDays(today(), 1);
  if (/\btoday\b|\binniki\b/.test(t)) checkIn = today();
  if (/\bnext week\b/.test(t)) checkIn = addDays(today(), 7);

  const veg = /\b(veg|vegetarian|pure veg)\b/.test(t) && !/\bnon.?veg\b/.test(t);
  return { text: t, intents, guests, nights, budget, checkIn, veg, honeymoon: /\b(honeymoon|anniversary|romantic)\b/.test(t) };
}

const roomScore = (room, q) => {
  let s = room.rating * 10;
  if (q.guests) s -= Math.abs(room.capacity - q.guests) * 6; // best fit, not biggest
  if (q.honeymoon && /honeymoon|villa/i.test(room._id)) s += 25;
  if (q.text.includes('villa') && room.type === 'Villa') s += 30;
  if (q.text.includes('suite') && room.type === 'Suite') s += 20;
  if (q.text.includes('cottage') && room.type === 'Cottage') s += 30;
  return s;
};

function pickPackages(q, packages) {
  const named = packages.filter((p) =>
    [p.destination, p.name, ...p.places].some((field) =>
      field.toLowerCase().split(/[^a-z]+/).some((w) => w.length > 4 && q.text.includes(w)),
    ),
  );
  const pool = named.length ? named : packages;
  return pool
    .filter((p) => !q.nights || p.days <= Math.max(q.nights, 1) + 1)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 2);
}

export function respond(message, catalog) {
  const q = parse(message);
  const { rooms = [], packages = [], menu = [], offers = [], resort } = catalog;
  const guests = q.guests || 2;
  const nights = q.nights || 1;
  const checkOut = addDays(q.checkIn, nights);
  const out = { text: '', rooms: [], packages: [], menu: [], offers: [], links: [], chips: [], context: { guests, nights, checkIn: q.checkIn, checkOut } };

  if (!q.intents.length || (q.intents.length === 1 && (q.intents[0] === 'greet' || q.intents[0] === 'thanks'))) {
    out.text = q.intents.includes('thanks')
      ? 'Happy to help! 😊 Anything else — rooms, food, tours or a cab?'
      : 'Vanakkam! 👋 Tell me what you need — e.g. “room for 2 people for 2 nights and Kanyakumari sightseeing”.';
    out.chips = ['Room for 2 for 2 nights', 'Kanyakumari sightseeing', 'Airport pickup', 'Show offers'];
    return out;
  }

  const parts = [];
  // A tour or cab request alone shouldn't trigger room suggestions unless nights/stay are mentioned.
  const wantsRoom = q.intents.includes('room') || (q.nights && !q.intents.includes('food'));

  if (wantsRoom) {
    const fits = rooms.filter((r) => r.capacity >= Math.min(guests, 4) && (!q.budget || r.price <= q.budget));
    out.rooms = [...fits].sort((a, b) => roomScore(b, q) - roomScore(a, q)).slice(0, 3);
    const roomsNeeded = Math.ceil(guests / Math.max(...out.rooms.map((r) => r.capacity), 1));
    out.context.rooms = roomsNeeded;
    parts.push(out.rooms.length ? `${out.rooms.length} suitable room${out.rooms.length !== 1 ? 's' : ''}` : `no rooms in that budget (rooms start at ${inr(Math.min(...rooms.map((r) => r.price)))})`);
  }
  if (q.intents.includes('tour')) {
    out.packages = pickPackages(q, packages);
    parts.push(`${out.packages.length} sightseeing package${out.packages.length !== 1 ? 's' : ''}`);
  }
  if (q.intents.includes('food')) {
    out.menu = menu.filter((m) => (q.veg ? m.veg : true) && (m.popular || q.text.includes(m.name.toLowerCase().split(' ').pop()))).slice(0, 3);
    parts.push(`${out.menu.length} chef’s picks${q.veg ? ' (veg)' : ''}`);
    out.links.push({ label: 'Open full menu', to: '/restaurant' });
  }
  if (q.intents.includes('cab')) {
    const where = /airport|flight/.test(q.text) ? 'airport' : /railway|station|train/.test(q.text) ? 'railway' : 'sightseeing';
    parts.push(`${where} transfers from ${inr(catalog.vehicles?.[0] ? catalog.vehicles[0].base + catalog.vehicles[0].perKm * (where === 'railway' ? 3 : 90) : 1500)}`);
    out.links.push({ label: `Book ${where} cab`, to: `/transport?service=${where}` });
  }
  if (q.intents.includes('offers')) {
    out.offers = offers.slice(0, 3);
    parts.push(`${out.offers.length} live offers`);
  }

  if (parts.length) {
    const tail = wantsRoom ? ` for ${guests} guest${guests > 1 ? 's' : ''} · ${nights} night${nights > 1 ? 's' : ''}` : '';
    const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0];
    out.text = `Sure! I found ${list}${tail}.`;
    if (q.budget) out.text += ` Filtered for under ${inr(q.budget)}.`;
  }

  if (q.intents.includes('timing')) {
    out.text += `${out.text ? '\n\n' : ''}🕛 Check-in is ${resort.checkIn} and check-out is ${resort.checkOut}. Early check-in is free when available.`;
  }
  if (q.intents.includes('contact')) {
    out.text += `${out.text ? '\n\n' : ''}📍 ${resort.address}\n📞 ${resort.phone}`;
    out.links.push({ label: 'Chat on WhatsApp', href: `https://wa.me/${resort.whatsapp}` }, { label: 'Open map', to: '/contact' });
  }
  if (!out.text) out.text = 'I can help with rooms, food, tour packages, cabs and offers. What would you like?';

  out.chips = [
    !wantsRoom && 'Show rooms',
    !q.intents.includes('tour') && 'Sightseeing packages',
    !q.intents.includes('cab') && 'Airport pickup',
    !q.intents.includes('food') && 'Order food',
  ].filter(Boolean).slice(0, 3);
  return out;
}
