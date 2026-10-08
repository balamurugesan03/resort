import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, RotateCcw, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHero from '../components/PageHero.jsx';
import { Reveal, Tabs } from '../components/ui.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { cn, fmtDate, inr } from '@shared/lib/format.js';

const FILTERS = [
  { value: 'all', label: 'All offers' },
  { value: 'room', label: 'Room offers' },
  { value: 'food', label: 'Food offers' },
  { value: 'tour', label: 'Tour packages' },
  { value: 'cab', label: 'Cab' },
  { value: 'seasonal', label: 'Seasonal deals' },
];

function useCountdown(date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, new Date(`${date}T23:59:59`) - now);
  return { d: Math.floor(ms / 864e5), h: Math.floor((ms / 36e5) % 24), m: Math.floor((ms / 6e4) % 60), s: Math.floor((ms / 1e3) % 60) };
}

function Countdown({ date }) {
  const t = useCountdown(date);
  return (
    <div className="flex gap-1.5 font-mono text-xs">
      {Object.entries(t).map(([k, v]) => (
        <span key={k} className="rounded-lg bg-white/20 px-2 py-1 backdrop-blur">{String(v).padStart(2, '0')}{k}</span>
      ))}
    </div>
  );
}

function FlipCoupon({ offer }) {
  const [flipped, setFlipped] = useState(false);
  const { openBooking } = useBooking();
  const navigate = useNavigate();
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(offer.code);
    toast.success(`${offer.code} copied to clipboard`);
  };
  const useNow = (e) => {
    e.stopPropagation();
    if (offer.category === 'food') navigate('/restaurant');
    else openBooking({ type: offer.category === 'all' ? 'room' : offer.category });
  };
  return (
    <div className="perspective h-[380px] cursor-pointer" onClick={() => setFlipped((f) => !f)} onMouseEnter={() => matchMedia('(hover: hover)').matches && setFlipped(true)} onMouseLeave={() => setFlipped(false)}>
      <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} className="preserve-3d relative h-full w-full">
        {/* Front */}
        <div className={cn('backface-hidden absolute inset-0 overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-7 text-white shadow-lift', offer.color)}>
          <img src={offer.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between">
              <span className="chip bg-white/20 capitalize backdrop-blur">{offer.seasonal ? 'Seasonal' : offer.category === 'all' ? 'Everything' : offer.category}</span>
              <RotateCcw size={16} className="opacity-60" />
            </div>
            <p className="mt-auto font-display text-7xl font-semibold leading-none">{offer.type === 'percent' ? `${offer.value}%` : inr(offer.value)}</p>
            <p className="text-lg font-semibold">OFF</p>
            <h3 className="mt-3 font-sans text-xl font-bold">{offer.title}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs"><Timer size={14} /> <Countdown date={offer.validTill} /></div>
          </div>
        </div>
        {/* Back */}
        <div className="backface-hidden absolute inset-0 flex flex-col rounded-[1.75rem] bg-white p-7 shadow-lift ring-1 ring-ink/5" style={{ transform: 'rotateY(180deg)' }}>
          <h3 className="font-sans text-xl font-bold">{offer.title}</h3>
          <p className="mt-2 text-sm text-ink/60">{offer.description}</p>
          <ul className="mt-4 space-y-1.5 text-xs text-ink/55">
            <li>• Minimum spend {inr(offer.minAmount)}</li>
            <li>• Max discount {inr(offer.maxDiscount)}</li>
            <li>• Valid till {fmtDate(offer.validTill)}</li>
          </ul>
          <button onClick={copy} className="mt-auto flex items-center justify-between rounded-2xl border-2 border-dashed border-teal-400 bg-teal-50 px-5 py-4 font-mono text-lg font-bold tracking-[0.2em] text-teal-700 transition hover:bg-teal-100">
            {offer.code} <Copy size={18} />
          </button>
          <button onClick={useNow} className="btn-primary mt-3 w-full">Use now</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Offers() {
  const { offers } = useCatalog();
  const [filter, setFilter] = useState('all');
  const list = offers.filter((o) => filter === 'all' || (filter === 'seasonal' ? o.seasonal : o.category === filter || o.category === 'all'));
  return (
    <>
      <PageHero title="Offers &" highlight="Deals" subtitle="Stack savings on rooms, food, tours and cabs. Hover or tap a card to reveal its coupon code." image="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=2000&q=80" />
      <section className="container-x pb-24 pt-4">
        <Tabs id="offers" options={FILTERS} value={filter} onChange={setFilter} className="mb-10" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((o, i) => <Reveal key={o.code} delay={(i % 3) * 0.08}><FlipCoupon offer={o} /></Reveal>)}
        </div>
        <Reveal className="mt-16 flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-ink p-8 text-white md:flex-row md:p-12">
          <div>
            <h3 className="text-3xl font-semibold md:text-4xl">Coupons apply automatically at checkout</h3>
            <p className="mt-2 text-white/60">Just tap a code chip in the booking window — we’ll validate it instantly.</p>
          </div>
          <code className="rounded-2xl border border-white/20 px-6 py-4 font-mono text-xl tracking-widest text-amber-300">WELCOME10</code>
        </Reveal>
      </section>
    </>
  );
}
