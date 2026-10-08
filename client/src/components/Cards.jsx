import { motion } from 'framer-motion';
import { ArrowUpRight, BedDouble, Clock, Flame, MapPin, Maximize, Minus, Plus, Star, Users } from 'lucide-react';
import TiltCard from './TiltCard.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { cn, inr } from '@shared/lib/format.js';

export function RoomCard({ room, onView, details }) {
  const { openBooking } = useBooking();
  return (
    <TiltCard className="rounded-[1.75rem]" max={7}>
      <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-soft ring-1 ring-ink/5 transition-shadow duration-500 group-hover:shadow-lift">
        <button type="button" onClick={() => onView?.(room)} className="relative block aspect-[4/3] overflow-hidden" aria-label={`View ${room.name}`}>
          <img src={room.images[0]} alt={room.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          {room.tag && <span className="chip absolute left-4 top-4 bg-white/90 text-ink backdrop-blur">{room.tag}</span>}
          <span className="chip absolute right-4 top-4 bg-ink/70 text-white backdrop-blur"><Star size={12} className="fill-amber-400 text-amber-400" /> {room.rating}</span>
          <span className="absolute bottom-4 left-4 text-sm font-medium text-white/90" style={{ transform: 'translateZ(40px)' }}>{room.type} · {room.view}</span>
        </button>
        <div className="flex flex-1 flex-col p-6" style={{ transform: 'translateZ(30px)' }}>
          <h3 className="text-2xl font-semibold">{room.name}</h3>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink/60">
            <span className="flex items-center gap-1.5"><Users size={15} /> Up to {room.capacity}</span>
            <span className="flex items-center gap-1.5"><Maximize size={15} /> {room.size} m²</span>
            <span className="flex items-center gap-1.5"><BedDouble size={15} /> {room.bed}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 3).map((a) => <span key={a} className="chip bg-teal-50 text-teal-700">{a}</span>)}
            {room.amenities.length > 3 && <span className="chip bg-ink/5 text-ink/60">+{room.amenities.length - 3}</span>}
          </div>
          <div className="mt-auto flex items-end justify-between gap-3 pt-6">
            <p>
              <span className="text-2xl font-bold">{inr(room.price)}</span>
              <span className="text-sm text-ink/50"> /night</span>
            </p>
            <button onClick={() => openBooking({ type: 'room', item: room, details })} className="btn-primary px-5 py-2.5">Book Now</button>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

export function PackageCard({ pkg, onView }) {
  const { openBooking } = useBooking();
  return (
    <TiltCard className="rounded-[1.75rem]" max={8}>
      <article className="relative flex h-full min-h-[460px] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-ink text-white shadow-soft">
        <img src={pkg.image} alt={pkg.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <div className="absolute left-5 right-5 top-5 flex justify-between">
          <span className="chip glass text-white"><Clock size={12} /> {pkg.duration}</span>
          {pkg.tag && <span className="chip bg-gradient-to-r from-amber-400 to-rose-500 text-white">{pkg.tag}</span>}
        </div>
        <div className="relative p-6" style={{ transform: 'translateZ(50px)' }}>
          <p className="flex items-center gap-1.5 text-sm text-teal-300"><MapPin size={14} /> {pkg.destination}</p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight">{pkg.name}</h3>
          <p className="mt-3 line-clamp-2 text-sm text-white/70">{pkg.places.join(' · ')}</p>
          <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-5">
            <p>
              <span className="text-xs text-white/60">from</span>
              <span className="block text-2xl font-bold">{inr(pkg.price)}<span className="text-sm font-normal text-white/60"> /person</span></span>
            </p>
            <div className="flex gap-2">
              {onView && <button onClick={() => onView(pkg)} className="btn-glass px-4 py-2.5" aria-label={`Itinerary for ${pkg.name}`}><ArrowUpRight size={18} /></button>}
              <button onClick={() => openBooking({ type: 'tour', item: pkg })} className="btn bg-white px-5 py-2.5 text-ink hover:bg-amber-100">Book</button>
            </div>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

export function MenuCard({ item }) {
  const cart = useCart();
  const qty = cart.qtyOf(item._id);
  return (
    <motion.article layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="group flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-soft ring-1 ring-ink/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <span className={cn('absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-md border-2 bg-white', item.veg ? 'border-emerald-600' : 'border-rose-600')} title={item.veg ? 'Veg' : 'Non-veg'}>
          <span className={cn('h-2.5 w-2.5 rounded-full', item.veg ? 'bg-emerald-600' : 'bg-rose-600')} />
        </span>
        {item.popular && <span className="chip absolute right-3 top-3 bg-amber-400 text-ink"><Flame size={12} /> Popular</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-sans text-lg font-bold leading-snug">{item.name}</h3>
          {item.spicy > 0 && <span className="shrink-0 text-xs" title="Spice level">{'🌶️'.repeat(item.spicy)}</span>}
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink/60">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-bold">{inr(item.price)}</span>
          {qty === 0 ? (
            <button onClick={() => cart.add(item)} className="btn-dark px-4 py-2"><Plus size={16} /> Add</button>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-ink p-1 text-white">
              <button onClick={() => cart.setQty(item._id, qty - 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15" aria-label="Decrease"><Minus size={14} /></button>
              <span className="w-6 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => cart.add(item)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15" aria-label="Increase"><Plus size={14} /></button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

