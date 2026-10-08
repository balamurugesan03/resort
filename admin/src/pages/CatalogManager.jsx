import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageOff, Loader2, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { api } from '@shared/lib/api.js';
import { cn, fmtDate, inr } from '@shared/lib/format.js';
import { AdminHeader } from './adminUi.jsx';

const OFFER_COLORS = [
  ['from-orange-400 to-rose-500', 'Sunset'], ['from-amber-400 to-orange-500', 'Amber'], ['from-emerald-400 to-teal-600', 'Lagoon'],
  ['from-sky-400 to-indigo-600', 'Ocean'], ['from-violet-400 to-fuchsia-600', 'Orchid'], ['from-teal-400 to-cyan-600', 'Sea'],
];

// Field types: text · number · textarea · select · checkbox · date · image · list (one value per line)
const CONFIG = {
  rooms: {
    title: 'Rooms & villas', singular: 'room', key: 'rooms',
    fields: [
      ['name', 'Name', 'text', { required: true, wide: true }],
      ['type', 'Type', 'select', { options: ['Room', 'Suite', 'Villa', 'Cottage'] }],
      ['tag', 'Badge', 'text', { placeholder: 'Best seller' }],
      ['price', 'Price / night (₹)', 'number', { required: true }],
      ['capacity', 'Max guests', 'number', { required: true }],
      ['totalUnits', 'Units in inventory', 'number', { required: true }],
      ['size', 'Size (m²)', 'number'],
      ['bed', 'Bed', 'text'],
      ['view', 'View', 'text'],
      ['rating', 'Rating', 'number', { step: 0.1 }],
      ['description', 'Description', 'textarea', { wide: true }],
      ['amenities', 'Amenities (one per line)', 'list', { wide: true }],
      ['images', 'Image URLs (one per line, first is the cover)', 'list', { wide: true, images: true, required: true }],
    ],
    defaults: { type: 'Room', capacity: 2, totalUnits: 5, rating: 4.5, amenities: [], images: [] },
    card: (r) => ({ image: r.images?.[0], title: r.name, meta: `${r.type} · ${r.capacity} guests · ${r.totalUnits} units`, price: `${inr(r.price)}/night`, rating: r.rating }),
  },
  menu: {
    title: 'Food menu', singular: 'dish', key: 'menu',
    fields: [
      ['name', 'Dish name', 'text', { required: true, wide: true }],
      ['category', 'Category', 'select', { options: 'menuCategories' }],
      ['price', 'Price (₹)', 'number', { required: true }],
      ['spicy', 'Spice level', 'select', { options: [['0', 'Not spicy'], ['1', 'Mild 🌶️'], ['2', 'Hot 🌶️🌶️'], ['3', 'Very hot 🌶️🌶️🌶️']], number: true }],
      ['veg', 'Vegetarian', 'checkbox'],
      ['popular', 'Mark as popular', 'checkbox'],
      ['description', 'Description', 'textarea', { wide: true }],
      ['image', 'Image URL', 'image', { wide: true, required: true }],
    ],
    defaults: { category: 'South Indian', spicy: 0, veg: true, popular: false },
    card: (m) => ({ image: m.image, title: m.name, meta: `${m.category} · ${m.veg ? 'Veg' : 'Non-veg'}${m.popular ? ' · Popular' : ''}`, price: inr(m.price) }),
  },
  packages: {
    title: 'Tour packages', singular: 'package', key: 'packages',
    fields: [
      ['name', 'Package name', 'text', { required: true, wide: true }],
      ['destination', 'Destination', 'text', { required: true }],
      ['duration', 'Duration label', 'text', { placeholder: '2 Days / 1 Night' }],
      ['days', 'Days', 'number', { required: true }],
      ['price', 'Price / person (₹)', 'number', { required: true }],
      ['rating', 'Rating', 'number', { step: 0.1 }],
      ['tag', 'Badge', 'text', { placeholder: 'Trending' }],
      ['image', 'Cover image URL', 'image', { wide: true, required: true }],
      ['places', 'Places covered (one per line)', 'list', { wide: true }],
      ['includes', 'Included (one per line)', 'list', { wide: true }],
    ],
    defaults: { days: 1, duration: '1 Day', rating: 4.5, places: [], includes: [], itinerary: [] },
    card: (p) => ({ image: p.image, title: p.name, meta: `${p.destination} · ${p.duration}`, price: `${inr(p.price)}/person`, rating: p.rating }),
  },
  offers: {
    title: 'Offers & coupons', singular: 'offer', key: 'offers',
    fields: [
      ['code', 'Coupon code', 'text', { required: true, upper: true }],
      ['title', 'Title', 'text', { required: true }],
      ['description', 'Description', 'textarea', { wide: true }],
      ['category', 'Applies to', 'select', { options: [['room', 'Rooms'], ['food', 'Food'], ['tour', 'Tours'], ['cab', 'Cabs'], ['all', 'Everything']] }],
      ['type', 'Discount type', 'select', { options: [['percent', 'Percent %'], ['flat', 'Flat ₹']] }],
      ['value', 'Discount value', 'number', { required: true }],
      ['minAmount', 'Minimum spend (₹)', 'number'],
      ['maxDiscount', 'Max discount (₹)', 'number'],
      ['validTill', 'Valid till', 'date', { required: true }],
      ['color', 'Card colour', 'select', { options: OFFER_COLORS }],
      ['seasonal', 'Seasonal deal', 'checkbox'],
      ['image', 'Background image URL', 'image', { wide: true }],
    ],
    defaults: { category: 'room', type: 'percent', value: 10, minAmount: 0, maxDiscount: 1000, color: OFFER_COLORS[0][0], seasonal: false },
    card: (o) => ({ image: o.image, title: `${o.code} — ${o.title}`, meta: `${o.category} · valid till ${fmtDate(o.validTill)}`, price: o.type === 'percent' ? `${o.value}% off` : `${inr(o.value)} off`, expired: new Date(o.validTill) < new Date() }),
  },
  vehicles: {
    title: 'Vehicles', singular: 'vehicle', key: 'vehicles',
    fields: [
      ['name', 'Vehicle class', 'text', { required: true }],
      ['example', 'Example models', 'text', { placeholder: 'Innova Crysta' }],
      ['seats', 'Seats', 'number', { required: true }],
      ['bags', 'Bags', 'number'],
      ['perKm', 'Rate per km (₹)', 'number', { required: true }],
      ['base', 'Base fare (₹)', 'number', { required: true }],
      ['ac', 'Air conditioned', 'checkbox'],
      ['image', 'Image URL', 'image', { wide: true, required: true }],
    ],
    defaults: { seats: 4, bags: 2, ac: true, perKm: 12, base: 300 },
    card: (v) => ({ image: v.image, title: v.name, meta: `${v.example || ''} · ${v.seats} seats`, price: `${inr(v.perKm)}/km + ${inr(v.base)}` }),
  },
};

function FormModal({ cfg, item, onClose, onSaved }) {
  const catalog = useCatalog();
  const isNew = !item._id;
  const [form, setForm] = useState(() => ({ ...cfg.defaults, ...item }));
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (cfg.fields.some(([k, , t, o]) => o?.required && t === 'list' && !(form[k] || []).length)) return toast.error('Add at least one image URL');
    setBusy(true);
    try {
      const saved = await api(isNew ? `/admin/${cfg.key}` : `/admin/${cfg.key}/${item._id}`, { method: isNew ? 'POST' : 'PUT', body: form });
      toast.success(`${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)} ${isNew ? 'added' : 'updated'}`);
      onSaved(saved);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`${isNew ? 'Add' : 'Edit'} ${cfg.singular}`}>
      <form onSubmit={submit} className="p-6 pt-8 sm:p-8">
        <h2 className="text-2xl font-semibold">{isNew ? `Add ${cfg.singular}` : `Edit ${item.name || item.code}`}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {cfg.fields.map(([k, label, type, o = {}]) => {
            const id = `f-${k}`;
            const wrap = cn(o.wide && 'sm:col-span-2');
            if (type === 'checkbox') {
              return (
                <label key={k} className={cn('flex cursor-pointer items-center gap-3 self-end rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-medium', wrap)}>
                  <input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-teal-600" /> {label}
                </label>
              );
            }
            let input;
            if (type === 'select') {
              const opts = (o.options === 'menuCategories' ? catalog.menuCategories : o.options).map((x) => (Array.isArray(x) ? x : [x, x]));
              input = (
                <select id={id} className="input" value={String(form[k] ?? '')} onChange={(e) => set(k, o.number ? Number(e.target.value) : e.target.value)}>
                  {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              );
            } else if (type === 'textarea') {
              input = <textarea id={id} rows={3} className="input resize-none" value={form[k] || ''} onChange={(e) => set(k, e.target.value)} />;
            } else if (type === 'list') {
              input = (
                <>
                  <textarea id={id} rows={o.images ? 3 : 4} className="input resize-y font-mono text-xs" value={(form[k] || []).join('\n')} onChange={(e) => set(k, e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} />
                  {o.images && (form[k] || []).length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto">{form[k].map((src) => <img key={src} src={src} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover ring-1 ring-ink/10" />)}</div>
                  )}
                </>
              );
            } else if (type === 'image') {
              input = (
                <div className="flex gap-3">
                  <input id={id} type="url" required={o.required} className="input" value={form[k] || ''} onChange={(e) => set(k, e.target.value)} placeholder="https://images.unsplash.com/…" />
                  {form[k] ? <img src={form[k]} alt="" className="h-12 w-16 shrink-0 rounded-xl object-cover ring-1 ring-ink/10" /> : <span className="grid h-12 w-16 shrink-0 place-items-center rounded-xl bg-ink/5 text-ink/30"><ImageOff size={18} /></span>}
                </div>
              );
            } else {
              input = (
                <input
                  id={id}
                  type={type}
                  step={o.step}
                  required={o.required}
                  placeholder={o.placeholder}
                  disabled={o.upper && !isNew}
                  className={cn('input', o.upper && 'font-mono uppercase')}
                  value={form[k] ?? ''}
                  onChange={(e) => set(k, type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : o.upper ? e.target.value.toUpperCase() : e.target.value)}
                />
              );
            }
            return (
              <div key={k} className={wrap}>
                <label htmlFor={id} className="label">{label}{o.required && ' *'}</label>
                {input}
              </div>
            );
          })}
        </div>
        <div className="mt-7 flex gap-3">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button className="btn-primary flex-1" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} {isNew ? `Add ${cfg.singular}` : 'Save changes'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function CatalogManager() {
  const { collection } = useParams();
  const cfg = CONFIG[collection];
  const catalog = useCatalog();
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');
  const [deleting, setDeleting] = useState(null);
  const items = useMemo(() => (cfg ? catalog[cfg.key] : []).filter((x) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase())), [catalog, cfg, q]);
  if (!cfg) return <Navigate to="/" replace />;

  const remove = async (item) => {
    if (!confirm(`Delete “${item.name || item.code}”? It will disappear from the website.`)) return;
    setDeleting(item._id);
    try {
      await api(`/admin/${cfg.key}/${item._id}`, { method: 'DELETE' });
      await catalog.refresh(cfg.key);
      toast.success('Deleted');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <AdminHeader
        title={cfg.title}
        subtitle={`${catalog[cfg.key].length} ${cfg.singular}s · changes go live on the website immediately`}
        action={<button onClick={() => setEditing({})} className="btn-primary"><Plus size={16} /> Add {cfg.singular}</button>}
      />
      <label className="relative mb-6 block max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${cfg.singular}s…`} aria-label={`Search ${cfg.singular}s`} className="input rounded-full py-2.5 pl-10" />
      </label>
      <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {items.map((item) => {
            const c = cfg.card(item);
            return (
              <motion.article layout key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex gap-4 rounded-3xl bg-white p-3 shadow-soft ring-1 ring-ink/5">
                {c.image ? <img src={c.image} alt="" className="h-24 w-24 shrink-0 rounded-2xl object-cover" /> : <span className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-ink/5 text-ink/30"><ImageOff /></span>}
                <div className="flex min-w-0 flex-1 flex-col py-1 pr-1">
                  <p className="truncate font-bold">{c.title}</p>
                  <p className="truncate text-xs capitalize text-ink/50">{c.meta}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                    {c.price}
                    {c.rating && <span className="flex items-center gap-0.5 text-xs font-normal text-ink/50"><Star size={11} className="fill-amber-400 text-amber-400" />{c.rating}</span>}
                    {c.expired && <span className="chip bg-rose-50 text-rose-600">Expired</span>}
                  </p>
                  <div className="mt-auto flex justify-end gap-1">
                    <button onClick={() => setEditing(item)} className="grid h-9 w-9 place-items-center rounded-full text-ink/60 hover:bg-ink/5 hover:text-ink" aria-label={`Edit ${c.title}`}><Pencil size={15} /></button>
                    <button onClick={() => remove(item)} disabled={deleting === item._id} className="grid h-9 w-9 place-items-center rounded-full text-ink/60 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${c.title}`}>
                      {deleting === item._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
      {items.length === 0 && <p className="py-16 text-center text-sm text-ink/50">Nothing here yet.</p>}
      {editing && (
        <FormModal
          key={editing._id || 'new'}
          cfg={cfg}
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await catalog.refresh(cfg.key);
          }}
        />
      )}
    </>
  );
}
