import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, MapPin, Star } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import Modal from '../components/Modal.jsx';
import { PackageCard } from '../components/Cards.jsx';
import { Reveal, SectionHeading, Tabs } from '../components/ui.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { inr } from '@shared/lib/format.js';

export default function Packages() {
  const { packages } = useCatalog();
  const [view, setView] = useState(null);
  const [len, setLen] = useState('All');
  const list = packages.filter((p) => len === 'All' || (len === 'Day trips' ? p.days === 1 : p.days > 1));

  return (
    <>
      <PageHero title="Tour" highlight="Packages" subtitle="Temples, waterfalls, palaces and backwaters — hand-crafted trips with AC transport, guides and meals." image="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2000&q=80" />
      <section className="container-x pb-24 pt-6">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Tabs id="pkg-len" options={['All', 'Day trips', 'Multi-day']} value={len} onChange={setLen} />
          <p className="text-sm text-ink/50">{list.length} packages · prices per person</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p._id} delay={(i % 3) * 0.08}><PackageCard pkg={p} onView={setView} /></Reveal>
          ))}
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-x">
          <SectionHeading eyebrow="Why book with us" title={<>Travel without <em className="text-gradient-sea">the planning</em></>} />
          <div className="grid gap-5 md:grid-cols-4">
            {[
              ['Hotel pickup & drop', 'Every tour starts and ends at the resort lobby.'],
              ['Licensed local guides', 'Stories you won’t find on Google.'],
              ['Free cancellation', 'Up to 24 hours before departure.'],
              ['All-inclusive pricing', 'Fuel, tolls, parking and tickets included.'],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.06} className="rounded-3xl bg-sand p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-600 text-white"><Check size={18} /></span>
                <h3 className="mt-4 font-sans text-lg font-bold">{t}</h3>
                <p className="mt-1 text-sm text-ink/60">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PackageDetail pkg={view} onClose={() => setView(null)} />
    </>
  );
}

function PackageDetail({ pkg, onClose }) {
  const { openBooking } = useBooking();
  return (
    <Modal open={!!pkg} onClose={onClose} title={pkg?.name} wide>
      {pkg && (
        <>
          <div className="relative h-64 overflow-hidden sm:h-80">
            <img src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span className="flex items-center gap-1"><MapPin size={14} /> {pkg.destination}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {pkg.duration}</span>
                <span className="flex items-center gap-1"><Star size={14} className="fill-amber-400 text-amber-400" /> {pkg.rating}</span>
              </p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{pkg.name}</h2>
            </div>
          </div>
          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-ink/50">Itinerary</h3>
              <ol className="relative mt-5 space-y-6 border-l-2 border-dashed border-teal-200 pl-6">
                {pkg.itinerary.map((s, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative">
                    <span className="absolute -left-[33px] top-0.5 grid h-4 w-4 place-items-center rounded-full bg-teal-500 ring-4 ring-sand" />
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-600">{s.time}</p>
                    <p className="mt-0.5 font-bold">{s.title}</p>
                    {s.detail && <p className="text-sm text-ink/60">{s.detail}</p>}
                  </motion.li>
                ))}
              </ol>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-ink/50">Places covered</h3>
                <div className="mt-3 flex flex-wrap gap-2">{pkg.places.map((p) => <span key={p} className="chip bg-teal-50 py-1.5 text-teal-700"><MapPin size={12} /> {p}</span>)}</div>
              </div>
              <div>
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-ink/50">Included</h3>
                <ul className="mt-3 space-y-2 text-sm">{pkg.includes.map((x) => <li key={x} className="flex items-center gap-2"><Check size={15} className="text-teal-600" /> {x}</li>)}</ul>
              </div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-ink/5">
                <p><span className="text-3xl font-bold">{inr(pkg.price)}</span><span className="text-ink/50"> /person</span></p>
                <button onClick={() => { onClose(); openBooking({ type: 'tour', item: pkg }); }} className="btn-primary mt-4 w-full py-3.5">Book Package</button>
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
