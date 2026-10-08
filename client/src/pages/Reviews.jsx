import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Loader2, PenLine, Quote, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHero from '../components/PageHero.jsx';
import Modal from '../components/Modal.jsx';
import { Reveal, Stars, Tabs } from '../components/ui.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '@shared/lib/api.js';
import { cn, fmtDate } from '@shared/lib/format.js';

export default function Reviews() {
  const { reviews, rooms, refresh } = useCatalog();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [photo, setPhoto] = useState(null);
  const [writing, setWriting] = useState(false);

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));
  const list = reviews.filter((r) => filter === 'all' || (filter === 'photos' ? r.photos?.length : r.rating === Number(filter)));
  const featured = reviews.find((r) => r.rating === 5);

  return (
    <>
      <PageHero title="Guest" highlight="Reviews" subtitle="Real stories from real guests. Every review is from a verified stay." image="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=2000&q=80" />

      <section className="container-x pb-24 pt-4">
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <Reveal className="rounded-[2rem] bg-white p-7 shadow-soft ring-1 ring-ink/5">
              <p className="font-display text-7xl font-semibold">{avg.toFixed(1)}</p>
              <Stars value={avg} size={20} className="mt-2" />
              <p className="mt-2 text-sm text-ink/50">Based on {reviews.length} reviews</p>
              <div className="mt-6 space-y-2.5">
                {dist.map(({ n, count }) => (
                  <button key={n} onClick={() => setFilter(String(n))} className="flex w-full items-center gap-3 text-sm">
                    <span className="flex w-8 items-center gap-1 font-semibold">{n}<Star size={12} className="fill-amber-400 text-amber-400" /></span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink/5">
                      <motion.span initial={{ width: 0 }} whileInView={{ width: `${(count / (reviews.length || 1)) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }} className="block h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                    </span>
                    <span className="w-6 text-right text-ink/50">{count}</span>
                  </button>
                ))}
              </div>
              {user ? (
                <button onClick={() => setWriting(true)} className="btn-primary mt-7 w-full"><PenLine size={16} /> Write a review</button>
              ) : (
                <Link to="/login" state={{ from: '/reviews' }} className="btn-dark mt-7 w-full">Log in to write a review</Link>
              )}
            </Reveal>
            {featured && (
              <Reveal delay={0.1} className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white">
                <Quote size={40} className="text-teal-400" />
                <p className="mt-3 font-display text-xl italic leading-snug">“{featured.title}”</p>
                <p className="mt-4 text-sm text-white/60">— {featured.name}, {featured.city}</p>
              </Reveal>
            )}
          </aside>

          <div>
            <Tabs id="rev" options={[{ value: 'all', label: 'All' }, { value: 'photos', label: 'With photos' }, { value: '5', label: '5 ★' }, { value: '4', label: '4 ★' }]} value={filter} onChange={setFilter} className="mb-6" />
            <motion.div layout className="space-y-5">
              <AnimatePresence mode="popLayout">
                {list.map((r) => (
                  <motion.article key={r._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-ink/5 sm:p-7">
                    <header className="flex items-center gap-4">
                      {r.avatar ? <img src={r.avatar} alt="" className="h-12 w-12 rounded-full object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-teal-400 to-sky-600 font-bold text-white">{r.name[0]}</span>}
                      <div className="flex-1">
                        <p className="flex items-center gap-1.5 font-bold">{r.name} {r.verified && <BadgeCheck size={16} className="text-teal-600" aria-label="Verified stay" />}</p>
                        <p className="text-xs text-ink/50">{[r.city, r.stay, fmtDate(r.date)].filter(Boolean).join(' · ')}</p>
                      </div>
                      <Stars value={r.rating} />
                    </header>
                    {r.title && <h3 className="mt-4 font-sans text-lg font-bold">{r.title}</h3>}
                    <p className="mt-2 leading-relaxed text-ink/70">{r.text}</p>
                    {r.photos?.length > 0 && (
                      <div className="mt-4 flex gap-3">
                        {r.photos.map((p) => (
                          <button key={p} onClick={() => setPhoto(p)} className="overflow-hidden rounded-2xl">
                            <img src={p} alt="Guest photo" loading="lazy" className="h-24 w-32 object-cover transition-transform duration-500 hover:scale-110" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      <Modal open={!!photo} onClose={() => setPhoto(null)} title="Guest photo" wide className="bg-ink">
        {photo && <img src={photo.replace('w=600', 'w=1600')} alt="Guest photo" className="w-full" />}
      </Modal>
      <WriteReview open={writing} onClose={() => setWriting(false)} rooms={rooms} onDone={() => refresh('reviews')} />
    </>
  );
}

function WriteReview({ open, onClose, rooms, onDone }) {
  const [form, setForm] = useState({ rating: 5, title: '', text: '', stay: rooms[0]?.name, photo: '' });
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/reviews', { method: 'POST', body: { ...form, photos: form.photo ? [form.photo] : [] } });
      toast.success('Thank you for your review! 🌅');
      onDone();
      onClose();
      setForm((f) => ({ ...f, title: '', text: '', photo: '' }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Write a review">
      <form onSubmit={submit} className="space-y-4 p-6 pt-8 sm:p-8">
        <h2 className="text-3xl font-semibold">How was your stay?</h2>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onMouseEnter={() => setHover(n)} onClick={() => setForm((f) => ({ ...f, rating: n }))} aria-label={`${n} stars`}>
              <Star size={34} className={cn('transition', n <= (hover || form.rating) ? 'scale-110 fill-amber-400 text-amber-400' : 'text-ink/15')} />
            </button>
          ))}
        </div>
        <label className="block"><span className="label">Where did you stay?</span>
          <select className="input" value={form.stay} onChange={(e) => setForm((f) => ({ ...f, stay: e.target.value }))}>{rooms.map((r) => <option key={r._id}>{r.name}</option>)}</select>
        </label>
        <label className="block"><span className="label">Title</span><input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Sum it up in a line" /></label>
        <label className="block"><span className="label">Your review *</span><textarea required rows={4} className="input resize-none" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} placeholder="What did you love?" /></label>
        <label className="block"><span className="label">Photo URL (optional)</span><input type="url" className="input" value={form.photo} onChange={(e) => setForm((f) => ({ ...f, photo: e.target.value }))} placeholder="https://…" /></label>
        <button className="btn-primary w-full py-3.5" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Post review</button>
      </form>
    </Modal>
  );
}
