import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BedDouble, CalendarDays, Check, Eye, Maximize, SlidersHorizontal, Star, Users } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import Modal from '../components/Modal.jsx';
import { RoomCard } from '../components/Cards.jsx';
import { Empty, Reveal, Tabs } from '../components/ui.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { fmtDate, inr } from '@shared/lib/format.js';
import { nightsBetween } from '@shared/pricing.js';

export default function Rooms() {
  const { rooms } = useCatalog();
  const [params] = useSearchParams();
  const stay = params.get('checkIn') ? { checkIn: params.get('checkIn'), checkOut: params.get('checkOut'), guests: Number(params.get('guests')) || 2 } : undefined;
  const [type, setType] = useState('All');
  const [guests, setGuests] = useState(stay?.guests || 1);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sort, setSort] = useState('recommended');
  const [view, setView] = useState(null);

  const list = useMemo(() => {
    const r = rooms.filter((x) => (type === 'All' || x.type === type) && x.capacity >= Math.min(guests, 4) && x.price <= maxPrice);
    const by = { recommended: (a, b) => b.rating - a.rating, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, size: (a, b) => b.size - a.size };
    return r.sort(by[sort]);
  }, [rooms, type, guests, maxPrice, sort]);

  return (
    <>
      <PageHero title="Rooms &" highlight="Villas" subtitle="Six ways to stay — from cosy garden cottages to private pool villas with a butler." image="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2000&q=80" />
      <section className="container-x -mt-6 pb-24">
        {stay && (
          <Reveal className="mb-6 flex flex-wrap items-center gap-3 rounded-3xl bg-teal-600 px-6 py-4 text-white shadow-soft">
            <CalendarDays size={20} />
            <span className="font-semibold">{fmtDate(stay.checkIn)} → {fmtDate(stay.checkOut)}</span>
            <span className="text-white/70">· {nightsBetween(stay.checkIn, stay.checkOut)} nights · {stay.guests} guests</span>
            <span className="ml-auto text-sm text-white/80">Prices below are per night. Live availability shown at booking.</span>
          </Reveal>
        )}

        <div className="sticky top-24 z-30 mb-10 flex flex-col gap-4 rounded-3xl bg-white/85 p-4 shadow-soft ring-1 ring-ink/5 backdrop-blur-xl lg:flex-row lg:items-center">
          <Tabs id="room-type" options={['All', 'Room', 'Suite', 'Villa', 'Cottage']} value={type} onChange={setType} />
          <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
            <label className="flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm">
              <Users size={16} className="text-teal-600" />
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="bg-transparent font-semibold focus:outline-none" aria-label="Guests">
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}{n === 4 ? '+' : ''} guest{n > 1 ? 's' : ''}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-full bg-sand px-4 py-2 text-sm">
              <SlidersHorizontal size={16} className="text-teal-600" />
              <span className="whitespace-nowrap font-semibold">≤ {inr(maxPrice)}</span>
              <input type="range" min={3000} max={15000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-24 accent-teal-600" aria-label="Maximum price" />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full bg-sand px-4 py-2.5 text-sm font-semibold focus:outline-none" aria-label="Sort">
              <option value="recommended">Top rated</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="size">Most spacious</option>
            </select>
          </div>
        </div>

        {list.length === 0 ? (
          <Empty icon={BedDouble} title="No rooms match" text="Try increasing your budget or changing the room type." action={<button className="btn-dark" onClick={() => { setType('All'); setMaxPrice(15000); setGuests(1); }}>Reset filters</button>} />
        ) : (
          <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((r) => (
                <motion.div key={r._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <RoomCard room={r} onView={setView} details={stay} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        <p className="mt-10 flex items-center justify-center gap-2 text-sm text-ink/50"><Eye size={16} /> Tap a photo to see the full room tour, amenities and availability.</p>
      </section>
      <RoomDetail room={view} onClose={() => setView(null)} stay={stay} />
    </>
  );
}

function RoomDetail({ room, onClose, stay }) {
  const { openBooking } = useBooking();
  const [img, setImg] = useState(0);
  if (!room) return <Modal open={false} onClose={onClose} />;
  return (
    <Modal open={!!room} onClose={() => { setImg(0); onClose(); }} title={room.name} wide>
      <div className="grid md:grid-cols-[1.2fr_1fr]">
        <div className="bg-ink p-3">
          <AnimatePresence mode="wait">
            <motion.img key={img} src={room.images[img]} alt={room.name} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="aspect-[4/3] w-full rounded-[1.5rem] object-cover" />
          </AnimatePresence>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {room.images.map((src, i) => (
              <button key={src} onClick={() => setImg(i)} className={`overflow-hidden rounded-xl ring-2 transition ${i === img ? 'ring-amber-400' : 'ring-transparent opacity-60 hover:opacity-100'}`}>
                <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col p-6 sm:p-8">
          <span className="eyebrow">{room.type} · {room.view}</span>
          <h2 className="mt-3 text-4xl font-semibold">{room.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm"><Star size={15} className="fill-amber-400 text-amber-400" /> <strong>{room.rating}</strong> <span className="text-ink/50">guest rating</span></p>
          <p className="mt-4 text-ink/65">{room.description}</p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
            {[[Users, `${room.capacity} guests`], [Maximize, `${room.size} m²`], [BedDouble, room.bed]].map(([Icon, t]) => (
              <div key={t} className="rounded-2xl bg-white p-3 ring-1 ring-ink/5"><Icon size={18} className="mx-auto mb-1 text-teal-600" />{t}</div>
            ))}
          </div>
          <h3 className="mt-6 font-sans text-sm font-bold uppercase tracking-wider text-ink/50">Amenities</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {room.amenities.map((a) => <li key={a} className="flex items-center gap-2"><Check size={15} className="text-teal-600" /> {a}</li>)}
          </ul>
          <div className="mt-auto flex items-center justify-between gap-4 pt-8">
            <p><span className="text-3xl font-bold">{inr(room.price)}</span><span className="text-ink/50"> /night</span></p>
            <button onClick={() => { onClose(); openBooking({ type: 'room', item: room, details: stay }); }} className="btn-primary px-7 py-3.5">Check & Book</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
