import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, Clock, Leaf, Search, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import { MenuCard } from '../components/Cards.jsx';
import { Empty, Reveal, Tabs } from '../components/ui.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { cn, inr } from '@shared/lib/format.js';

export default function Restaurant() {
  const { menu, menuCategories } = useCatalog();
  const cart = useCart();
  const [cat, setCat] = useState('All');
  const [veg, setVeg] = useState(false);
  const [q, setQ] = useState('');

  const items = useMemo(
    () => menu.filter((m) => (cat === 'All' || m.category === cat) && (!veg || m.veg) && `${m.name} ${m.description}`.toLowerCase().includes(q.toLowerCase())),
    [menu, cat, veg, q],
  );

  return (
    <>
      <PageHero title="The Shoreline" highlight="Kitchen" subtitle="Coastal Tamil classics, North Indian favourites and continental comfort food — dine-in, takeaway or room service." image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80" />

      <section className="container-x -mt-4 pb-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [UtensilsCrossed, 'Dine-in', 'Breakfast 7–10:30 · Lunch 12:30–3:30 · Dinner 7–11'],
            [BellRing, 'Room service', '24 × 7 · delivered in ~30 minutes'],
            [Clock, 'Takeaway', 'Ready in 20 minutes at the lobby counter'],
          ].map(([Icon, t, d], i) => (
            <Reveal key={t} delay={i * 0.06} className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink/5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600"><Icon size={22} /></span>
              <span><span className="block font-bold">{t}</span><span className="text-sm text-ink/55">{d}</span></span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x pb-28">
        <div className="sticky top-24 z-30 mb-8 flex flex-col gap-3 rounded-3xl bg-white/85 p-3 shadow-soft ring-1 ring-ink/5 backdrop-blur-xl lg:flex-row lg:items-center">
          <Tabs id="menu-cat" options={['All', ...menuCategories]} value={cat} onChange={setCat} className="flex-1" />
          <div className="flex gap-2">
            <label className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes" aria-label="Search dishes" className="w-full rounded-full bg-sand py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 lg:w-48" />
            </label>
            <button onClick={() => setVeg((v) => !v)} className={cn('flex shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 transition', veg ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-ink/70 ring-ink/10')} aria-pressed={veg}>
              <Leaf size={15} /> Veg only
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <Empty icon={UtensilsCrossed} title="No dishes found" text="Try a different search or category." />
        ) : (
          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {items.map((m) => <MenuCard key={m._id} item={m} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {cart.count > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md lg:bottom-6">
            <button onClick={() => cart.setOpen(true)} className="flex w-full items-center gap-4 rounded-full bg-ink p-2 pr-6 text-white shadow-lift">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500"><ShoppingBag size={20} /></span>
              <span className="flex-1 text-left"><span className="block text-sm font-bold">{cart.count} item{cart.count > 1 ? 's' : ''} · {inr(cart.subtotal)}</span><span className="text-xs text-white/60">Tap to review & order</span></span>
              <span className="text-sm font-bold">Order Food →</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
