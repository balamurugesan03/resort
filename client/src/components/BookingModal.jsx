import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgePercent, Check, CircleCheck, CreditCard, Hotel, Loader2, Lock, Smartphone, Ticket, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from './Modal.jsx';
import AuthForm from './AuthForm.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api } from '@shared/lib/api.js';
import { addDays, cn, fmtDate, inr, today } from '@shared/lib/format.js';
import { applyCoupon, quote, totals, TAX_RATE } from '@shared/pricing.js';

const TITLES = { room: 'Book your stay', tour: 'Book tour package', cab: 'Book transport', food: 'Place food order' };
const PAY_METHODS = [
  { id: 'upi', label: 'UPI', icon: Smartphone, hint: 'GPay · PhonePe · Paytm' },
  { id: 'card', label: 'Card', icon: CreditCard, hint: 'Visa · Mastercard · RuPay' },
  { id: 'resort', label: 'Pay at resort', icon: Wallet, hint: 'Cash or card on arrival' },
];

function initialDetails({ type, item, details = {} }, catalog, cart) {
  const tomorrow = addDays(today(), 1);
  switch (type) {
    case 'room':
      return { roomId: item?._id || catalog.rooms[0]._id, checkIn: tomorrow, checkOut: addDays(tomorrow, 1), guests: 2, rooms: 1, request: '', ...details };
    case 'tour':
      return { packageId: item?._id || catalog.packages[0]._id, date: tomorrow, people: 2, pickup: 'Resort lobby', ...details };
    case 'cab': {
      const service = catalog.transportServices.find((s) => s._id === details.serviceId) || catalog.transportServices[0];
      return { serviceId: service._id, routeId: service.routes[0].id, vehicleId: item?._id || catalog.vehicles[0]._id, date: tomorrow, time: '10:00', passengers: 2, roundTrip: false, reference: '', ...details };
    }
    case 'food':
      return { items: cart.items.map((l) => ({ id: l._id, qty: l.qty })), orderType: 'room-service', roomNo: '', time: 'ASAP', notes: '', ...details };
    default:
      return details;
  }
}

function Field({ label, children, className }) {
  return (
    <label className={cn('block', className)}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export default function BookingModal({ request, onClose }) {
  const catalog = useCatalog();
  const cart = useCart();
  const { user } = useAuth();
  const { type } = request;
  const [details, setDetails] = useState(() => initialDetails(request, catalog, cart));
  const [step, setStep] = useState('details');
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [method, setMethod] = useState('upi');
  const [availability, setAvailability] = useState(null);
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState(null);
  const set = (k) => (e) => setDetails((d) => ({ ...d, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));

  const priced = useMemo(() => {
    try {
      return { ...quote(type, { ...details }, catalog), error: null };
    } catch (err) {
      return { subtotal: 0, error: err.message };
    }
  }, [type, details, catalog]);
  const discount = coupon ? applyCoupon(coupon, type, priced.subtotal) : null;
  const sum = totals(priced.subtotal, discount?.ok ? discount.discount : 0);

  // Live availability for rooms.
  useEffect(() => {
    if (type !== 'room' || priced.error) return setAvailability(null);
    let live = true;
    setAvailability('loading');
    const t = setTimeout(() => {
      api(`/rooms/${details.roomId}/availability?checkIn=${details.checkIn}&checkOut=${details.checkOut}`)
        .then((r) => live && setAvailability(r))
        .catch(() => live && setAvailability(null));
    }, 300);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [type, details.roomId, details.checkIn, details.checkOut, priced.error]);

  const applyCode = () => {
    const offer = catalog.offers.find((o) => o.code === code.trim().toUpperCase());
    const r = applyCoupon(offer, type, priced.subtotal);
    if (r.ok) {
      setCoupon(offer);
      toast.success(r.message);
    } else {
      setCoupon(null);
      toast.error(r.message);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const b = await api('/bookings', { method: 'POST', body: { type, details, coupon: discount?.ok ? coupon.code : undefined, paymentMethod: method } });
      setBooking(b);
      setStep('done');
      if (type === 'food') cart.clear();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const room = catalog.rooms.find((r) => r._id === details.roomId);
  const pkg = catalog.packages.find((p) => p._id === details.packageId);
  const service = catalog.transportServices.find((s) => s._id === details.serviceId);
  const vehicle = catalog.vehicles.find((v) => v._id === details.vehicleId);
  const cover = { room: room?.images[0], tour: pkg?.image, cab: vehicle?.image || service?.image, food: cart.items[0]?.image || catalog.menu[0].image }[type];
  const soldOut = availability && availability !== 'loading' && !availability.available;
  const canContinue = !priced.error && !soldOut && (type !== 'food' || details.orderType !== 'room-service' || details.roomNo);

  return (
    <Modal open onClose={onClose} title={TITLES[type]} wide>
      <div className="grid md:grid-cols-[0.85fr_1.15fr]">
        {/* Summary */}
        <aside className="relative hidden overflow-hidden bg-ink p-8 text-white md:block">
          <AnimatePresence mode="wait">
            <motion.img key={cover} src={cover} alt="" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 0.45, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 h-full w-full object-cover" />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
          <div className="relative flex h-full flex-col">
            <span className="eyebrow text-teal-300">{TITLES[type]}</span>
            <h3 className="mt-3 text-3xl font-semibold leading-tight">{priced.title || '—'}</h3>
            <div className="mt-auto space-y-2.5 rounded-2xl border border-white/15 bg-white/10 p-5 text-sm backdrop-blur-md">
              <Row label="Subtotal" value={inr(sum.subtotal)} />
              {sum.discount > 0 && <Row label={`Coupon ${coupon.code}`} value={`− ${inr(sum.discount)}`} className="text-emerald-300" />}
              <Row label={`Taxes (GST ${TAX_RATE * 100}%)`} value={inr(sum.tax)} />
              <div className="my-1 border-t border-white/15" />
              <Row label="Total" value={inr(sum.total)} className="text-lg font-bold" />
            </div>
          </div>
        </aside>

        <div className="p-6 pt-8 sm:p-8">
          <Steps step={step} />
          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                {type === 'room' && (
                  <>
                    <Field label="Room / villa">
                      <select className="input" value={details.roomId} onChange={set('roomId')}>
                        {catalog.rooms.map((r) => <option key={r._id} value={r._id}>{r.name} — {inr(r.price)}/night · up to {r.capacity}</option>)}
                      </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Check-in"><input type="date" className="input" min={today()} value={details.checkIn} onChange={(e) => setDetails((d) => ({ ...d, checkIn: e.target.value, checkOut: d.checkOut <= e.target.value ? addDays(e.target.value, 1) : d.checkOut }))} /></Field>
                      <Field label="Check-out"><input type="date" className="input" min={addDays(details.checkIn, 1)} value={details.checkOut} onChange={set('checkOut')} /></Field>
                      <Field label="Guests"><input type="number" className="input" min={1} max={20} value={details.guests} onChange={set('guests')} /></Field>
                      <Field label="Rooms"><input type="number" className="input" min={1} max={6} value={details.rooms} onChange={set('rooms')} /></Field>
                    </div>
                    <AvailabilityBadge availability={availability} />
                    <Field label="Special request (optional)"><input className="input" value={details.request} onChange={set('request')} placeholder="Early check-in, anniversary decor…" /></Field>
                  </>
                )}

                {type === 'tour' && (
                  <>
                    <Field label="Package">
                      <select className="input" value={details.packageId} onChange={set('packageId')}>
                        {catalog.packages.map((p) => <option key={p._id} value={p._id}>{p.name} — {inr(p.price)}/person</option>)}
                      </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Travel date"><input type="date" className="input" min={today()} value={details.date} onChange={set('date')} /></Field>
                      <Field label="People"><input type="number" className="input" min={1} max={40} value={details.people} onChange={set('people')} /></Field>
                    </div>
                    <Field label="Pickup point"><input className="input" value={details.pickup} onChange={set('pickup')} /></Field>
                  </>
                )}

                {type === 'cab' && (
                  <>
                    <Field label="Service">
                      <select className="input" value={details.serviceId} onChange={(e) => { const s = catalog.transportServices.find((x) => x._id === e.target.value); setDetails((d) => ({ ...d, serviceId: s._id, routeId: s.routes[0].id })); }}>
                        {catalog.transportServices.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Route">
                      <select className="input" value={details.routeId} onChange={set('routeId')}>
                        {service?.routes.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.km} km</option>)}
                      </select>
                    </Field>
                    <Field label="Vehicle">
                      <select className="input" value={details.vehicleId} onChange={set('vehicleId')}>
                        {catalog.vehicles.map((v) => <option key={v._id} value={v._id}>{v.name} ({v.example}) · {v.seats} seats</option>)}
                      </select>
                    </Field>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Date"><input type="date" className="input" min={today()} value={details.date} onChange={set('date')} /></Field>
                      <Field label="Time"><input type="time" className="input" value={details.time} onChange={set('time')} /></Field>
                      <Field label="Passengers"><input type="number" className="input" min={1} max={vehicle?.seats || 30} value={details.passengers} onChange={set('passengers')} /></Field>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label={details.serviceId === 'airport' ? 'Flight no.' : details.serviceId === 'railway' ? 'Train / PNR' : 'Notes'}><input className="input" value={details.reference} onChange={set('reference')} placeholder="Optional" /></Field>
                      <label className="flex cursor-pointer items-center gap-3 self-end rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-medium">
                        <input type="checkbox" checked={details.roundTrip} onChange={set('roundTrip')} className="h-4 w-4 accent-teal-600" /> Round trip
                      </label>
                    </div>
                  </>
                )}

                {type === 'food' && (
                  <>
                    <ul className="divide-y divide-ink/5 rounded-2xl bg-white p-2 ring-1 ring-ink/5">
                      {cart.items.map((l) => (
                        <li key={l._id} className="flex items-center gap-3 p-2 text-sm">
                          <img src={l.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                          <span className="flex-1 font-medium">{l.name} <span className="text-ink/50">× {l.qty}</span></span>
                          <span className="font-semibold">{inr(l.qty * l.price)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="grid grid-cols-3 gap-2">
                      {[['room-service', 'Room service'], ['dine-in', 'Dine-in'], ['takeaway', 'Takeaway']].map(([v, l]) => (
                        <button key={v} type="button" onClick={() => set('orderType')(v)} className={cn('rounded-2xl px-3 py-3 text-sm font-semibold ring-1 transition', details.orderType === v ? 'bg-ink text-white ring-ink' : 'bg-white ring-ink/10 hover:ring-ink/30')}>{l}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {details.orderType === 'room-service' ? (
                        <Field label="Room number *"><input className="input" value={details.roomNo} onChange={set('roomNo')} placeholder="e.g. 204" /></Field>
                      ) : (
                        <Field label="Guests"><input type="number" className="input" min={1} defaultValue={2} onChange={set('guests')} /></Field>
                      )}
                      <Field label="When">
                        <select className="input" value={details.time} onChange={set('time')}>
                          {['ASAP', 'In 30 min', 'In 1 hour', 'Lunch 1:00 PM', 'Dinner 8:00 PM'].map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Cooking notes"><input className="input" value={details.notes} onChange={set('notes')} placeholder="Less spicy, no onion…" /></Field>
                  </>
                )}

                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input className="input pl-10 uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" />
                  </div>
                  <button type="button" onClick={applyCode} disabled={!code} className="btn-dark">Apply</button>
                </div>
                <div className="no-scrollbar -mt-1 flex gap-2 overflow-x-auto">
                  {catalog.offers.filter((o) => o.category === type || o.category === 'all').map((o) => (
                    <button key={o.code} type="button" onClick={() => setCode(o.code)} className="chip shrink-0 bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100">
                      <BadgePercent size={12} /> {o.code}
                    </button>
                  ))}
                </div>

                <MobileTotal sum={sum} />
                {priced.error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600">{priced.error}</p>}
                <button className="btn-primary w-full py-4 text-base" disabled={!canContinue} onClick={() => setStep('pay')}>
                  Continue to payment · {inr(sum.total)}
                </button>
              </motion.div>
            )}

            {step === 'pay' && (
              <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                {!user ? (
                  <div>
                    <p className="mb-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-800">Log in to save this booking to your account — it takes 5 seconds.</p>
                    <AuthForm compact />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {PAY_METHODS.map((m) => (
                        <button key={m.id} type="button" onClick={() => setMethod(m.id)} className={cn('relative rounded-2xl p-4 text-left ring-1 transition', method === m.id ? 'bg-white shadow-soft ring-2 ring-teal-500' : 'bg-white/60 ring-ink/10 hover:ring-ink/30')}>
                          {method === m.id && <Check size={16} className="absolute right-3 top-3 text-teal-600" />}
                          <m.icon size={22} className="text-teal-600" />
                          <span className="mt-3 block text-sm font-bold">{m.label}</span>
                          <span className="block text-xs text-ink/50">{m.hint}</span>
                        </button>
                      ))}
                    </div>
                    {method === 'upi' && <input className="input" placeholder="yourname@upi" aria-label="UPI ID" defaultValue={`${user.name.split(' ')[0].toLowerCase()}@okaxis`} />}
                    {method === 'card' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input className="input col-span-2" placeholder="4111 1111 1111 1111" aria-label="Card number" defaultValue="4111 1111 1111 1111" />
                        <input className="input" placeholder="MM/YY" aria-label="Expiry" defaultValue="12/29" />
                        <input className="input" placeholder="CVV" aria-label="CVV" defaultValue="123" />
                      </div>
                    )}
                    <MobileTotal sum={sum} />
                    <p className="flex items-center gap-2 text-xs text-ink/50"><Lock size={12} /> Demo payment — no real money is charged.</p>
                    <div className="flex gap-3">
                      <button className="btn-outline" onClick={() => setStep('details')}>Back</button>
                      <button className="btn-primary flex-1 py-4 text-base" onClick={confirm} disabled={busy}>
                        {busy && <Loader2 size={18} className="animate-spin" />}
                        {method === 'resort' ? 'Confirm booking' : `Pay ${inr(sum.total)}`}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {step === 'done' && booking && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
                <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-teal-500/30">
                  <CircleCheck size={40} />
                </motion.span>
                <h3 className="mt-6 text-3xl font-semibold">Booking confirmed!</h3>
                <p className="mt-2 text-ink/60">{booking.title}</p>
                <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3 text-left text-sm">
                  <Info label="Invoice" value={booking.invoiceNo} />
                  <Info label="Amount" value={inr(booking.total)} />
                  <Info label="Payment" value={booking.payment.method === 'resort' ? 'At resort' : 'Paid'} />
                  <Info label="Booked on" value={fmtDate(booking.createdAt)} />
                </dl>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link to="/account" onClick={onClose} className="btn-dark"><Hotel size={16} /> View my bookings</Link>
                  <button className="btn-outline" onClick={onClose}>Done</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}

const Row = ({ label, value, className }) => (
  <div className={cn('flex justify-between', className)}><span className="opacity-80">{label}</span><span>{value}</span></div>
);
const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-white p-3 ring-1 ring-ink/5"><dt className="text-xs text-ink/50">{label}</dt><dd className="font-semibold">{value}</dd></div>
);

function MobileTotal({ sum }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-sm ring-1 ring-ink/5 md:hidden">
      <Row label="Subtotal" value={inr(sum.subtotal)} />
      {sum.discount > 0 && <Row label="Discount" value={`− ${inr(sum.discount)}`} className="text-emerald-600" />}
      <Row label="Taxes" value={inr(sum.tax)} />
      <Row label="Total" value={inr(sum.total)} className="mt-1 text-base font-bold" />
    </div>
  );
}

function Steps({ step }) {
  const steps = ['details', 'pay', 'done'];
  const idx = steps.indexOf(step);
  return (
    <ol className="mb-7 flex items-center gap-2 pr-12 text-xs font-semibold">
      {['Details', 'Payment', 'Confirmed'].map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2">
          <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full transition', i <= idx ? 'bg-ink text-white' : 'bg-ink/5 text-ink/40')}>{i < idx ? <Check size={14} /> : i + 1}</span>
          <span className={cn('hidden sm:inline', i <= idx ? 'text-ink' : 'text-ink/40')}>{s}</span>
          {i < 2 && <span className={cn('h-px flex-1', i < idx ? 'bg-ink' : 'bg-ink/10')} />}
        </li>
      ))}
    </ol>
  );
}

function AvailabilityBadge({ availability }) {
  if (!availability) return null;
  if (availability === 'loading') return <p className="flex items-center gap-2 text-sm text-ink/50"><Loader2 size={14} className="animate-spin" /> Checking availability…</p>;
  return availability.available ? (
    <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Available — {availability.roomsLeft} left for these dates
    </p>
  ) : (
    <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">Sold out for these dates — try other dates or rooms.</p>
  );
}
