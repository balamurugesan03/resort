import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import PageHero from '../components/PageHero.jsx';
import { Tabs } from '../components/ui.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

export default function Gallery() {
  const { gallery, galleryCategories } = useCatalog();
  const [cat, setCat] = useState('All');
  const [index, setIndex] = useState(null);
  const items = gallery.filter((g) => cat === 'All' || g.category === cat);

  const move = useCallback((d) => setIndex((i) => (i + d + items.length) % items.length), [items.length]);
  useEffect(() => {
    if (index === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIndex(null);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, move]);

  const current = index !== null ? items[index] : null;
  return (
    <>
      <PageHero title="The" highlight="Gallery" subtitle="Sunrises, sea-view suites, sizzling grills and sacred temples — a glimpse of life at Sagara Shores." image="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=2000&q=80" />
      <section className="container-x pb-24 pt-4">
        <Tabs id="gallery" options={['All', ...galleryCategories]} value={cat} onChange={(c) => { setCat(c); setIndex(null); }} className="mb-10" />
        <motion.div layout className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          <AnimatePresence mode="popLayout">
            {items.map((g, i) => (
              <motion.button
                layout
                key={g._id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                onClick={() => setIndex(i)}
                className="group relative block w-full break-inside-avoid overflow-hidden rounded-[1.5rem]"
              >
                <img src={g.src.replace('w=1200', 'w=800')} alt={g.title} loading="lazy" className={`w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110 ${i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {g.video && (
                  <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lift transition group-hover:scale-110">
                    <Play size={22} className="ml-1 fill-ink" />
                  </span>
                )}
                <span className="absolute bottom-4 left-4 translate-y-4 text-left text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="block text-xs text-teal-300">{g.category}</span>
                  <span className="font-semibold">{g.title}</span>
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {createPortal(
        <AnimatePresence>
          {current && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex flex-col bg-ink/95 backdrop-blur-xl" role="dialog" aria-label={current.title}>
              <div className="flex items-center justify-between p-4 text-white">
                <p className="text-sm"><span className="text-white/50">{index + 1} / {items.length} · </span>{current.title}</p>
                <button onClick={() => setIndex(null)} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close"><X size={20} /></button>
              </div>
              <div className="relative flex flex-1 items-center justify-center px-4 pb-8">
                <AnimatePresence mode="wait">
                  {current.video ? (
                    <motion.video key={current._id} src={current.video} poster={current.src} controls autoPlay playsInline initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-h-[78vh] max-w-full rounded-2xl" />
                  ) : (
                    <motion.img key={current._id} src={current.src.replace('w=1200', 'w=1800')} alt={current.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => Math.abs(info.offset.x) > 80 && move(info.offset.x < 0 ? 1 : -1)} className="max-h-[78vh] max-w-full rounded-2xl object-contain" />
                  )}
                </AnimatePresence>
                <button onClick={() => move(-1)} className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid" aria-label="Previous"><ChevronLeft /></button>
                <button onClick={() => move(1)} className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid" aria-label="Next"><ChevronRight /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
