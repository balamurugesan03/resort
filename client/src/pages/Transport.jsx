import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Luggage, Map, Plane, Route, Snowflake, Train, Users } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import TiltCard from '../components/TiltCard.jsx';
import { Reveal, SectionHeading } from '../components/ui.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { cn, inr } from '@shared/lib/format.js';
import { cabFare } from '@shared/pricing.js';

const ICONS = { plane: Plane, train: Train, map: Map };

export default function Transport() {
  const { transportServices, vehicles } = useCatalog();
  const { openBooking } = useBooking();
  const [params, setParams] = useSearchParams();
  const service = transportServices.find((s) => s._id === params.get('service')) || transportServices[0];
  const [routeId, setRouteId] = useState(null);
  const route = service.routes.find((r) => r.id === routeId) || service.routes[0];
  const pickService = (id) => { setParams({ service: id }, { replace: true }); setRouteId(null); };

  return (
    <>
      <PageHero title="Cab &" highlight="Transport" subtitle="Airport and railway pickups, sightseeing cabs and group coaches — fixed prices, verified drivers, no surprises." image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80" />

      <section className="container-x pb-24 pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          {transportServices.map((s) => {
            const Icon = ICONS[s.icon] || Route;
            const active = s._id === service._id;
            return (
              <button key={s._id} onClick={() => pickService(s._id)} className={cn('group relative overflow-hidden rounded-[1.75rem] p-6 text-left transition-all duration-500', active ? 'bg-ink text-white shadow-lift' : 'bg-white shadow-soft ring-1 ring-ink/5 hover:-translate-y-1')}>
                <img src={s.image} alt="" className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-500', active ? 'opacity-30' : 'opacity-0 group-hover:opacity-10')} />
                <div className="relative">
                  <span className={cn('grid h-12 w-12 place-items-center rounded-2xl', active ? 'bg-gradient-to-br from-amber-400 to-rose-500' : 'bg-teal-50 text-teal-600')}><Icon size={22} /></span>
                  <h3 className="mt-5 font-sans text-xl font-bold">{s.name}</h3>
                  <p className={cn('mt-1 text-sm', active ? 'text-white/70' : 'text-ink/55')}>{s.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-ink/5 sm:p-8">
          <p className="label">Choose route</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {service.routes.map((r) => (
              <button key={r.id} onClick={() => setRouteId(r.id)} className={cn('rounded-full px-4 py-2.5 text-sm font-semibold ring-1 transition', r.id === route.id ? 'bg-teal-600 text-white ring-teal-600' : 'bg-sand ring-transparent hover:ring-ink/10')}>
                {r.name} <span className="opacity-60">· {r.km} km</span>
              </button>
            ))}
          </div>

          <h3 className="mt-10 font-sans text-sm font-bold uppercase tracking-wider text-ink/50">Vehicle options · one-way fare</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {vehicles.map((v, i) => (
              <Reveal key={v._id} delay={i * 0.05}>
                <TiltCard className="rounded-[1.5rem]" max={10}>
                  <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-sand ring-1 ring-ink/5">
                    <img src={v.image} alt={v.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    <div className="flex flex-1 flex-col p-4" style={{ transform: 'translateZ(25px)' }}>
                      <h4 className="font-sans text-lg font-bold">{v.name}</h4>
                      <p className="text-xs text-ink/50">{v.example}</p>
                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/60">
                        <span className="flex items-center gap-1"><Users size={13} /> {v.seats}</span>
                        <span className="flex items-center gap-1"><Luggage size={13} /> {v.bags}</span>
                        {v.ac && <span className="flex items-center gap-1"><Snowflake size={13} /> AC</span>}
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.p key={route.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-2xl font-bold">{inr(cabFare(v, route.km))}</motion.p>
                      </AnimatePresence>
                      <p className="text-[11px] text-ink/40">{inr(v.perKm)}/km + {inr(v.base)} base</p>
                      <button onClick={() => openBooking({ type: 'cab', item: v, details: { serviceId: service._id, routeId: route.id, vehicleId: v._id } })} className="btn-primary mt-4 w-full py-2.5">Book Transport</button>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-x">
          <SectionHeading eyebrow="Every ride includes" title={<>Safe, punctual, <em className="text-gradient-sea">fixed-price</em></>} />
          <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
            {['Meet & greet with name board', 'Free flight & train delay tracking', 'Verified, uniformed drivers', 'Tolls, parking & driver allowance included', 'Free 60-min waiting at airports', 'Bottled water & phone chargers'].map((t, i) => (
              <Reveal key={t} delay={i * 0.04} className="flex items-center gap-3 rounded-2xl bg-sand px-5 py-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-600 text-white"><Check size={15} /></span>
                <span className="font-medium">{t}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
