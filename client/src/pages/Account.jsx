import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BedDouble, Car, CreditCard, Loader2, LogOut, Map, Printer, Receipt, UserRound, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthForm from '../components/AuthForm.jsx';
import Modal from '../components/Modal.jsx';
import { Empty } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { api } from '@shared/lib/api.js';
import { cn, fmtDate, inr, today } from '@shared/lib/format.js';
import { describe } from '@shared/lib/describe.js';

const SECTIONS = [
  { id: 'room', label: 'My Room Bookings', icon: BedDouble },
  { id: 'food', label: 'My Food Orders', icon: UtensilsCrossed },
  { id: 'tour', label: 'My Tour Bookings', icon: Map },
  { id: 'cab', label: 'My Cab Bookings', icon: Car },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'profile', label: 'Profile', icon: UserRound },
];
const STATUS = { confirmed: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-rose-50 text-rose-600', completed: 'bg-sky-50 text-sky-700' };


export default function Account() {
  const { user, ready, logout } = useAuth();
  const [tab, setTab] = useState('room');
  const [bookings, setBookings] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const load = useCallback(() => {
    if (user) api('/bookings/mine').then(setBookings).catch((e) => { toast.error(e.message); setBookings([]); });
  }, [user]);
  useEffect(load, [load]);

  if (!ready) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!user) {
    return (
      <section className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4 py-32">
        <img src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=2000&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="relative w-full max-w-md rounded-[2rem] bg-sand p-7 shadow-2xl sm:p-9">
          <h1 className="text-3xl font-semibold">My Account</h1>
          <p className="mb-6 mt-1 text-sm text-ink/60">Log in to see your bookings, orders and invoices.</p>
          <AuthForm />
        </div>
      </section>
    );
  }

  const active = (bookings || []).filter((b) => b.status !== 'cancelled');
  const spent = active.reduce((s, b) => s + b.total, 0);
  const upcoming = active.filter((b) => (b.details?.checkIn || b.details?.date || '') >= today()).length;

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-24 pt-36 text-white">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-500/25 blur-3xl" />
        <div className="absolute -bottom-40 left-20 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="container-x relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-5">
            <motion.span initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-teal-400 via-sky-500 to-violet-500 font-display text-4xl">{user.name[0]}</motion.span>
            <div>
              <p className="text-sm text-white/60">Vanakkam 👋</p>
              <h1 className="text-4xl font-semibold md:text-5xl">{user.name}</h1>
              <p className="text-sm text-white/50">{user.email}</p>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3">
            {[['Bookings', active.length], ['Upcoming', upcoming], ['Total spent', inr(spent)]].map(([l, v]) => (
              <div key={l} className="glass rounded-2xl px-4 py-3"><dt className="text-xs text-white/50">{l}</dt><dd className="text-xl font-bold">{bookings ? v : '—'}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-x relative -mt-12 grid gap-6 pb-24 lg:grid-cols-[260px_1fr]">
        <nav className="no-scrollbar flex gap-2 overflow-x-auto rounded-3xl bg-white p-2 shadow-soft ring-1 ring-ink/5 lg:sticky lg:top-28 lg:flex-col lg:self-start">
          {SECTIONS.map((s) => {
            const count = ['room', 'food', 'tour', 'cab'].includes(s.id) ? bookings?.filter((b) => b.type === s.id).length : null;
            return (
              <button key={s.id} onClick={() => setTab(s.id)} className={cn('relative flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition', tab === s.id ? 'text-white' : 'text-ink/70 hover:bg-ink/5')}>
                {tab === s.id && <motion.span layoutId="acct-tab" className="absolute inset-0 rounded-2xl bg-ink" />}
                <s.icon size={18} className="relative" />
                <span className="relative">{s.label}</span>
                {count > 0 && <span className={cn('relative ml-auto rounded-full px-2 text-xs', tab === s.id ? 'bg-white/20' : 'bg-ink/5')}>{count}</span>}
              </button>
            );
          })}
          <button onClick={logout} className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut size={18} /> Log out</button>
        </nav>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {bookings === null ? (
                <div className="grid h-60 place-items-center"><Loader2 className="animate-spin text-ink/40" /></div>
              ) : ['room', 'food', 'tour', 'cab'].includes(tab) ? (
                <BookingList type={tab} bookings={bookings.filter((b) => b.type === tab)} onChange={load} onInvoice={setInvoice} />
              ) : tab === 'payments' ? (
                <Payments bookings={bookings} />
              ) : tab === 'invoices' ? (
                <Invoices bookings={bookings} onInvoice={setInvoice} />
              ) : (
                <Profile />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
      <InvoiceModal booking={invoice} user={user} onClose={() => setInvoice(null)} />
    </>
  );
}

function BookingList({ type, bookings, onChange, onInvoice }) {
  const catalog = useCatalog();
  const { openBooking } = useBooking();
  const [busy, setBusy] = useState(null);
  const meta = SECTIONS.find((s) => s.id === type);
  const cancel = async (b) => {
    if (!confirm(`Cancel ${b.title}? The amount will be refunded to your original payment method.`)) return;
    setBusy(b._id);
    try {
      await api(`/bookings/${b._id}/cancel`, { method: 'PATCH' });
      toast.success('Booking cancelled — refund initiated');
      onChange();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };
  if (!bookings.length) {
    const cta = type === 'food' ? <Link to="/restaurant" className="btn-primary">Order food</Link> : <button onClick={() => openBooking({ type })} className="btn-primary">Book now</button>;
    return <Empty icon={meta.icon} title={`No ${meta.label.replace('My ', '').toLowerCase()} yet`} text="When you book, everything shows up here with invoices and payment status." action={cta} />;
  }
  return (
    <div className="space-y-4">
      {bookings.map((b) => (
        <motion.article layout key={b._id} className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-ink/5 sm:flex-row">
          <img src={b.image} alt="" className="h-40 w-full rounded-2xl object-cover sm:h-auto sm:w-40" />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-sans text-lg font-bold">{b.title}</h3>
              <span className={cn('chip capitalize', STATUS[b.status])}>{b.status}</span>
            </div>
            <p className="mt-1 text-sm text-ink/60">{describe(b, catalog)}</p>
            <p className="mt-1 text-xs text-ink/40">Invoice {b.invoiceNo} · booked {fmtDate(b.createdAt)}</p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
              <p className="text-xl font-bold">{inr(b.total)} {b.discount > 0 && <span className="text-xs font-semibold text-emerald-600">saved {inr(b.discount)}</span>}</p>
              <div className="flex gap-2">
                <button onClick={() => onInvoice(b)} className="btn-outline px-4 py-2"><Receipt size={15} /> Invoice</button>
                {b.status === 'confirmed' && (
                  <button onClick={() => cancel(b)} disabled={busy === b._id} className="btn px-4 py-2 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50">
                    {busy === b._id && <Loader2 size={14} className="animate-spin" />} Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function Payments({ bookings }) {
  if (!bookings.length) return <Empty icon={CreditCard} title="No payments yet" />;
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-ink/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-sand text-xs uppercase tracking-wider text-ink/50">
            <tr>{['Date', 'Transaction', 'For', 'Method', 'Amount', 'Status'].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {bookings.map((b) => (
              <tr key={b._id} className="hover:bg-sand/50">
                <td className="px-5 py-4">{fmtDate(b.payment?.paidAt || b.createdAt)}</td>
                <td className="px-5 py-4 font-mono text-xs">{b.payment?.txnId}</td>
                <td className="max-w-[200px] truncate px-5 py-4">{b.title}</td>
                <td className="px-5 py-4 uppercase">{b.payment?.method}</td>
                <td className="px-5 py-4 font-bold">{inr(b.total)}</td>
                <td className="px-5 py-4"><span className={cn('chip capitalize', b.payment?.status === 'refunded' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>{b.payment?.method === 'resort' && b.payment?.status === 'paid' ? 'Pay at resort' : b.payment?.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Invoices({ bookings, onInvoice }) {
  if (!bookings.length) return <Empty icon={Receipt} title="No invoices yet" />;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {bookings.map((b) => (
        <button key={b._id} onClick={() => onInvoice(b)} className="group flex items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-soft ring-1 ring-ink/5 transition hover:-translate-y-1">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-600 transition group-hover:rotate-6"><Receipt size={20} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-xs text-ink/50">{b.invoiceNo}</span>
            <span className="block truncate font-bold">{b.title}</span>
          </span>
          <span className="font-bold">{inr(b.total)}</span>
        </button>
      ))}
    </div>
  );
}

function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', city: user.city || '' });
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={save} className="grid gap-4 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink/5 sm:grid-cols-2 sm:p-8">
      <h2 className="text-2xl font-semibold sm:col-span-2">Profile details</h2>
      <label><span className="label">Full name</span><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label><span className="label">Email</span><input className="input bg-sand" value={user.email} disabled /></label>
      <label><span className="label">Phone</span><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label><span className="label">City</span><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
      <p className="text-xs text-ink/40 sm:col-span-2">Member since {fmtDate(user.createdAt)}</p>
      <button className="btn-primary sm:w-fit" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Save changes</button>
    </form>
  );
}

function InvoiceModal({ booking: b, user, onClose }) {
  const { resort } = useCatalog();
  const catalog = useCatalog();
  const lines = useMemo(() => {
    if (!b) return [];
    if (b.type === 'food') return (b.details.items || []).map((i) => [`${i.name || i.id} × ${i.qty}`, i.price * i.qty]);
    return [[b.title, b.subtotal]];
  }, [b]);
  const print = () => {
    const html = document.getElementById('invoice-sheet').outerHTML;
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return toast.error('Allow pop-ups to print the invoice');
    w.document.write(`<!doctype html><html><head><title>${b.invoiceNo}</title><style>body{font-family:system-ui,sans-serif;color:#0a1422;padding:32px}table{width:100%;border-collapse:collapse}td,th{padding:10px 0;border-bottom:1px solid #eee;text-align:left}td:last-child,th:last-child{text-align:right}.muted{color:#888;font-size:13px}.total{font-size:20px;font-weight:700}.row{display:flex;justify-content:space-between;gap:24px}h1{margin:0}</style></head><body>${html}<script>onload=()=>{print()}</script></body></html>`);
    w.document.close();
  };
  return (
    <Modal open={!!b} onClose={onClose} title="Invoice">
      {b && (
        <div className="p-6 pt-8 sm:p-8">
          <div id="invoice-sheet" className="rounded-3xl bg-white p-6 ring-1 ring-ink/5">
            <div className="row flex justify-between gap-6">
              <div>
                <h1 className="font-display text-2xl font-semibold">{resort.name}</h1>
                <p className="muted text-xs text-ink/50">{resort.address}<br />GSTIN 33ABCDE1234F1Z5 · {resort.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-ink/40">Tax invoice</p>
                <p className="font-mono font-bold">{b.invoiceNo}</p>
                <p className="muted text-xs text-ink/50">{fmtDate(b.createdAt)}</p>
              </div>
            </div>
            <p className="muted mt-6 text-xs text-ink/50">Billed to</p>
            <p className="font-semibold">{user.name}</p>
            <p className="muted text-xs text-ink/50">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>
            <p className="muted mt-2 text-xs text-ink/50">{describe(b, catalog)}</p>
            <table className="mt-6 w-full text-sm">
              <thead><tr className="text-left text-xs uppercase text-ink/40"><th className="py-2">Description</th><th className="py-2 text-right">Amount</th></tr></thead>
              <tbody className="divide-y divide-ink/5">
                {lines.map(([d, a]) => <tr key={d}><td className="py-2.5">{d}</td><td className="py-2.5 text-right">{inr(a)}</td></tr>)}
                {b.discount > 0 && <tr><td className="py-2.5">Discount ({b.coupon})</td><td className="py-2.5 text-right text-emerald-600">− {inr(b.discount)}</td></tr>}
                <tr><td className="py-2.5">GST 12%</td><td className="py-2.5 text-right">{inr(b.tax)}</td></tr>
                <tr><td className="total py-3 text-lg font-bold">Total</td><td className="total py-3 text-right text-lg font-bold">{inr(b.total)}</td></tr>
              </tbody>
            </table>
            <p className="muted mt-4 text-xs text-ink/50">Payment: {b.payment?.method?.toUpperCase()} · {b.payment?.status} · Txn {b.payment?.txnId}{b.status === 'cancelled' ? ' · BOOKING CANCELLED' : ''}</p>
          </div>
          <button onClick={print} className="btn-dark mt-5 w-full"><Printer size={16} /> Print / Save as PDF</button>
        </div>
      )}
    </Modal>
  );
}
