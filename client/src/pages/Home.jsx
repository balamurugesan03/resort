import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { animate, motion, useMotionValue, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, BedDouble, CalendarDays, Car, ChevronDown, Clock, Gift, MapPin, Phone, Play, Quote, Search, Star, Sunrise, Users, UtensilsCrossed, Waves,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { Counter, Reveal, SectionHeading, Stars } from '../components/ui.jsx';
import { RoomCard } from '../components/Cards.jsx';
import TiltCard from '../components/TiltCard.jsx';
import Modal from '../components/Modal.jsx';
import { addDays, cn, inr, today } from '@shared/lib/format.js';

const Hero3D = lazy(() => import('../components/Hero3D.jsx'));

const supportsWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

function Hero() {
  const { resort } = useCatalog();
  const navigate = useNavigate();
  const [video, setVideo] = useState(false);
  const [webgl] = useState(supportsWebGL);
  const [form, setForm] = useState({ checkIn: addDays(today(), 1), checkOut: addDays(today(), 3), guests: 2 });
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const search = (e) => {
    e.preventDefault();
    navigate(`/rooms?${new URLSearchParams(form)}`);
  };
  const words = ['Where', 'three', 'seas', 'meet', 'your', 'soul.'];

  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[720px] overflow-hidden bg-ink">
      <img src={resort.heroImage} alt="" className="absolute inset-0 -z-20 h-full w-full animate-kenburns object-cover" />
      {webgl && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 -z-10"><Hero3D image={resort.heroImage} /></div>
        </Suspense>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 to-transparent" />

      <motion.div style={{ y: textY, opacity: fade }} className="container-x pointer-events-none relative flex h-full flex-col justify-center pb-64 pt-24 md:pb-40 md:pt-28">
        <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="chip glass pointer-events-auto w-fit py-2 pl-2 pr-4 text-white">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-rose-500"><Sunrise size={13} /></span>
          Kanyakumari · Southernmost tip of India
        </motion.span>
        <h1 className="mt-6 max-w-3xl text-[13vw] font-semibold leading-[0.92] text-white sm:text-7xl lg:text-8xl" style={{ perspective: 800 }}>
          {words.map((w, i) => (
            <motion.span key={i} initial={{ opacity: 0, y: 60, rotateX: -80 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.4 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className={cn('mr-[0.22em] inline-block origin-bottom', i >= 4 && 'text-gradient italic')}>
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-6 line-clamp-3 max-w-lg text-base text-white/75 sm:line-clamp-none md:text-lg">
          {resort.intro}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 }} className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
          <Link to="/rooms" className="btn-primary px-6 py-3.5 sm:px-7 sm:py-4 sm:text-base">Book your stay <ArrowRight size={18} /></Link>
          <button onClick={() => setVideo(true)} className="group flex items-center gap-3 rounded-full py-2 pl-2 pr-5 text-sm font-semibold text-white">
            <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-ink transition group-hover:scale-110">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
              <Play size={16} className="relative ml-0.5 fill-ink" />
            </span>
            <span className="hidden sm:inline">Watch the film</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Booking bar */}
      <motion.form
        onSubmit={search}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-3 bottom-24 mx-auto grid max-w-5xl grid-cols-2 gap-2 rounded-[1.75rem] border border-white/20 bg-white/15 p-2 shadow-2xl backdrop-blur-2xl sm:inset-x-6 md:bottom-10 md:right-24 md:grid-cols-[1fr_1fr_0.8fr_auto]"
      >
        {[
          ['checkIn', 'Check-in', CalendarDays, 'date', today()],
          ['checkOut', 'Check-out', CalendarDays, 'date', addDays(form.checkIn, 1)],
        ].map(([k, label, Icon, type, min]) => (
          <label key={k} className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-2.5">
            <Icon size={18} className="hidden shrink-0 text-teal-600 sm:block" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-ink/50">{label}</span>
              <input type={type} min={min} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value, ...(k === 'checkIn' && f.checkOut <= e.target.value ? { checkOut: addDays(e.target.value, 1) } : {}) }))} className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none" />
            </span>
          </label>
        ))}
        <label className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-2.5">
          <Users size={18} className="hidden shrink-0 text-teal-600 sm:block" />
          <span className="flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-ink/50">Guests</span>
            <select value={form.guests} onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value }))} className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>)}
            </select>
          </span>
        </label>
        <button className="btn-primary rounded-2xl px-8 py-4"><Search size={18} /> <span className="md:hidden">Search</span><span className="hidden md:inline">Check availability</span></button>
      </motion.form>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 text-white/50 2xl:block"><ChevronDown /></motion.div>

      <Modal open={video} onClose={() => setVideo(false)} title="Resort film" wide className="bg-ink">
        <video src={resort.heroVideo} poster={resort.heroImage} autoPlay controls playsInline className="aspect-video w-full bg-ink" />
      </Modal>
    </section>
  );
}

function Marquee() {
  const items = ['Sunrise views', 'Infinity pool', 'Ayurvedic spa', 'Coastal cuisine', 'Private villas', 'Airport transfers', 'Curated tours', 'Beach yoga'];
  return (
    <div className="relative overflow-hidden border-y border-ink/5 bg-white py-5">
      <div className="flex w-max animate-marquee gap-10">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl italic text-ink/70 md:text-3xl">
            {t} <Star size={18} className="fill-amber-400 text-amber-400" />
          </span>
        ))}
      </div>
    </div>
  );
}

function About() {
  const { resort } = useCatalog();
  return (
    <section className="section overflow-hidden">
      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        <Reveal className="relative h-[480px] md:h-[560px]">
          <div className="absolute left-0 top-0 h-[78%] w-[72%]">
            <TiltCard max={6} glare={false}>
              <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80" alt="Infinity pool facing the sea" className="h-full w-full rounded-[2rem] object-cover shadow-lift" />
            </TiltCard>
          </div>
          <div className="absolute bottom-0 right-0 h-[55%] w-[55%]">
            <TiltCard max={8} glare={false}>
              <img src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=700&q=80" alt="Sunrise suite" className="h-full w-full rounded-[2rem] border-8 border-sand object-cover shadow-lift" />
            </TiltCard>
          </div>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute bottom-[40%] left-[58%] z-10 rounded-3xl bg-white p-4 shadow-lift">
            <p className="flex items-center gap-2 text-3xl font-bold">4.8 <Star className="fill-amber-400 text-amber-400" /></p>
            <p className="text-xs text-ink/50">from 2,400+ reviews</p>
          </motion.div>
          <div className="absolute -left-10 top-10 -z-10 h-64 w-64 rounded-full bg-teal-300/30 blur-3xl" />
          <div className="absolute -right-10 bottom-10 -z-10 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
        </Reveal>
        <div>
          <Reveal><span className="eyebrow">Welcome to {resort.name}</span></Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.05] md:text-6xl">
              A slow-living escape at <em className="text-gradient-sea">land’s end</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}><p className="mt-6 text-lg leading-relaxed text-ink/60">{resort.intro}</p></Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {resort.stats.map((s, i) => (
              <Reveal key={s.label} delay={0.1 + i * 0.05} className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink/5">
                <p className="font-display text-4xl font-semibold text-ink"><Counter value={s.value} suffix={s.suffix} decimals={s.decimals} /></p>
                <p className="mt-1 text-sm text-ink/50">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Explore() {
  const tiles = [
    { to: '/rooms', title: 'Rooms & Villas', text: 'Sea-view rooms to private pool villas', icon: BedDouble, img: 'photo-1611892440504-42a792e24d32', span: 'md:col-span-2 md:row-span-2' },
    { to: '/restaurant', title: 'Food', text: 'Order to your room', icon: UtensilsCrossed, img: 'photo-1600891964599-f61ba0e24092' },
    { to: '/packages', title: 'Tour Packages', text: 'Temples, falls & backwaters', icon: MapPin, img: 'photo-1593693397690-362cb9666fc2' },
    { to: '/transport', title: 'Cabs', text: 'Airport & railway pickup', icon: Car, img: 'photo-1533473359331-0135ef1b58bf' },
    { to: '/offers', title: 'Offers', text: 'Up to 25% off', icon: Gift, img: 'photo-1506461883276-594a12b11cf3' },
  ];
  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionHeading eyebrow="Everything in one place" title={<>Plan your entire trip, <em className="text-gradient-sea">right here</em></>} subtitle="Stay, dine, explore and travel — all booked in a couple of taps." />
        <div className="grid auto-rows-[220px] gap-4 md:grid-cols-4">
          {tiles.map((t, i) => (
            <Reveal key={t.to} delay={i * 0.06} className={t.span}>
              <TiltCard max={6} className="rounded-[1.75rem]">
                <Link to={t.to} className="relative flex h-full flex-col justify-end overflow-hidden rounded-[1.75rem] p-6 text-white">
                  <img src={`https://images.unsplash.com/${t.img}?auto=format&fit=crop&w=1000&q=80`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                  <span className="glass absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-2xl"><t.icon size={20} /></span>
                  <span className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white text-ink opacity-0 transition-all duration-500 group-hover:rotate-45 group-hover:opacity-100"><ArrowUpRight size={18} /></span>
                  <div className="relative" style={{ transform: 'translateZ(40px)' }}>
                    <h3 className={cn('font-semibold', t.span ? 'text-4xl' : 'text-2xl')}>{t.title}</h3>
                    <p className="mt-1 text-sm text-white/70">{t.text}</p>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoomsPreview() {
  const { rooms } = useCatalog();
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading align="left" eyebrow="Rooms & villas" title={<>Sleep to the sound <br className="hidden md:block" />of the <em className="text-gradient-sea">ocean</em></>} action={<Link to="/rooms" className="btn-outline">All rooms <ArrowRight size={16} /></Link>} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...rooms].sort((a, b) => b.rating - a.rating).slice(0, 3).map((r, i) => (
            <Reveal key={r._id} delay={i * 0.08}><RoomCard room={r} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FoodSection() {
  const { menu } = useCatalog();
  const popular = menu.filter((m) => m.popular);
  return (
    <section className="section relative overflow-hidden bg-ink text-white">
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Reveal><span className="eyebrow text-amber-300">The Shoreline Kitchen</span></Reveal>
          <Reveal delay={0.05}><h2 className="mt-4 text-4xl font-semibold leading-[1.05] md:text-6xl">Coastal flavours, <em className="text-gradient">served anywhere</em>.</h2></Reveal>
          <Reveal delay={0.1}><p className="mt-6 text-lg text-white/65">From banana-leaf meals to the morning’s catch — dine on the deck, or order room service in two taps. 24×7 kitchen.</p></Reveal>
          <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-3">
            <Link to="/restaurant" className="btn-primary px-7 py-4">Order food <ArrowRight size={18} /></Link>
            <Link to="/restaurant" className="btn-glass px-7 py-4">View menu</Link>
          </Reveal>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 lg:mx-0 lg:px-0">
          {popular.map((m, i) => (
            <Reveal key={m._id} delay={i * 0.06} className="w-64 shrink-0 snap-start">
              <TiltCard max={10} className="rounded-[1.75rem]">
                <Link to="/restaurant" className="block overflow-hidden rounded-[1.75rem] bg-white/5 ring-1 ring-white/10 backdrop-blur">
                  <img src={m.image} alt={m.name} loading="lazy" className="aspect-square w-full object-cover" />
                  <div className="p-5" style={{ transform: 'translateZ(30px)' }}>
                    <p className="text-xs text-amber-300">{m.category}</p>
                    <h3 className="mt-1 font-sans text-lg font-bold">{m.name}</h3>
                    <p className="mt-2 text-xl font-bold">{inr(m.price)}</p>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// CSS 3D ring carousel — auto-rotates, drag to spin.
function PackageRing() {
  const { packages } = useCatalog();
  const { openBooking } = useBooking();
  const rotation = useMotionValue(0);
  const [radius, setRadius] = useState(520);
  const [active, setActive] = useState(0);
  const dragging = useRef(false);
  const step = 360 / packages.length;

  useEffect(() => {
    const onResize = () => setRadius(window.innerWidth < 640 ? 260 : window.innerWidth < 1024 ? 400 : 520);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      if (dragging.current) return;
      const target = Math.round((rotation.get() - step) / step) * step;
      animate(rotation, target, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    }, 3500);
    const unsub = rotation.on('change', (v) => setActive(((Math.round(-v / step) % packages.length) + packages.length) % packages.length));
    return () => { clearInterval(id); unsub(); };
  }, [rotation, step, packages.length]);

  const pkg = packages[active];
  return (
    <section className="section overflow-hidden bg-gradient-to-b from-sand to-sand-2">
      <div className="container-x">
        <SectionHeading eyebrow="Tour packages" title={<>Explore beyond <em className="text-gradient-sea">the shore</em></>} subtitle="Drag to spin. Hand-picked trips with AC transport, guides and meals included." />
      </div>
      <div className="relative h-[420px] sm:h-[480px]" style={{ perspective: 1600 }}>
        <motion.div
          className="absolute left-1/2 top-1/2 h-[340px] w-[230px] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-pan-y active:cursor-grabbing sm:h-[400px] sm:w-[280px]"
          style={{ transformStyle: 'preserve-3d', z: -radius, rotateY: rotation }}
          onPanStart={() => { dragging.current = true; }}
          onPan={(_, info) => rotation.set(rotation.get() + info.delta.x * 0.3)}
          onPanEnd={(_, info) => {
            dragging.current = false;
            const target = Math.round((rotation.get() + info.velocity.x * 0.05) / step) * step;
            animate(rotation, target, { type: 'spring', stiffness: 60, damping: 18 });
          }}
        >
          {packages.map((p, i) => (
            <div key={p._id} className="absolute inset-0 overflow-hidden rounded-[1.75rem] shadow-lift" style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)`, backfaceVisibility: 'hidden' }}>
              <img src={p.image} alt={p.name} draggable={false} className="h-full w-full select-none object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-xs text-teal-300">{p.duration}</p>
                <h3 className="mt-1 text-xl font-semibold leading-tight">{p.name}</h3>
                <p className="mt-2 text-sm font-bold">{inr(p.price)} <span className="font-normal text-white/60">/person</span></p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      <div className="container-x mt-4 flex flex-col items-center gap-4 text-center">
        <motion.p key={pkg._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl text-sm text-ink/60">
          <strong className="text-ink">{pkg.name}:</strong> {pkg.places.slice(0, 4).join(' · ')}
        </motion.p>
        <div className="flex gap-3">
          <button onClick={() => openBooking({ type: 'tour', item: pkg })} className="btn-primary">Book this package</button>
          <Link to="/packages" className="btn-outline">All packages</Link>
        </div>
      </div>
    </section>
  );
}

function Activities() {
  const { activities } = useCatalog();
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading align="left" eyebrow="Activities" title={<>Days filled with <em className="text-gradient-sea">little joys</em></>} action={<Link to="/gallery" className="btn-outline">See gallery <ArrowRight size={16} /></Link>} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {activities.map((a, i) => (
            <Reveal key={a.title} delay={(i % 4) * 0.06}>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-[1.5rem]">
                <img src={a.image} alt={a.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
                <span className="chip absolute right-3 top-3 bg-white/90 text-ink">{a.price}</span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white transition-transform duration-500 md:translate-y-8 md:group-hover:translate-y-0">
                  <h3 className="font-sans text-base font-bold md:text-lg">{a.title}</h3>
                  <p className="mt-1 text-xs text-white/70 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100">{a.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OffersStrip() {
  const { offers } = useCatalog();
  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionHeading align="left" eyebrow="Offers" title={<>Deals that feel like <em className="text-gradient">sunshine</em></>} action={<Link to="/offers" className="btn-outline">All offers <ArrowRight size={16} /></Link>} />
        <div className="grid gap-5 md:grid-cols-3">
          {offers.slice(0, 3).map((o, i) => (
            <Reveal key={o.code} delay={i * 0.08}>
              <TiltCard className="rounded-[1.75rem]">
                <div className={cn('relative h-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-7 text-white', o.color)}>
                  <img src={o.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-overlay" />
                  <div className="relative" style={{ transform: 'translateZ(40px)' }}>
                    <p className="font-display text-6xl font-semibold">{o.type === 'percent' ? `${o.value}%` : inr(o.value)}<span className="text-2xl"> off</span></p>
                    <h3 className="mt-3 font-sans text-xl font-bold">{o.title}</h3>
                    <p className="mt-1 text-sm text-white/80">{o.description}</p>
                    <span className="mt-6 inline-block rounded-xl border-2 border-dashed border-white/60 px-4 py-2 font-mono text-sm font-bold tracking-widest">{o.code}</span>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const { reviews } = useCatalog();
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1);
  return (
    <section className="section overflow-hidden">
      <div className="container-x">
        <SectionHeading eyebrow="Guest stories" title={<>Loved by <em className="text-gradient-sea">12,800+</em> travellers</>} />
        <Reveal className="mb-12 flex flex-wrap items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <span className="font-display text-6xl font-semibold">{avg.toFixed(1)}</span>
            <span className="text-left"><Stars value={avg} size={18} /><span className="block text-sm text-ink/50">{reviews.length * 400}+ verified reviews</span></span>
          </div>
        </Reveal>
      </div>
      <div className="group relative">
        <div className="flex w-max animate-marquee gap-5 group-hover:[animation-play-state:paused]">
          {[...reviews, ...reviews].map((r, i) => (
            <figure key={i} className="w-[340px] shrink-0 rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-ink/5">
              <Quote className="text-teal-500" size={28} />
              <blockquote className="mt-3 line-clamp-4 text-ink/75">“{r.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                {r.avatar ? <img src={r.avatar} alt="" className="h-11 w-11 rounded-full object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-teal-100 font-bold text-teal-700">{r.name[0]}</span>}
                <span className="flex-1"><span className="block text-sm font-bold">{r.name}</span><span className="text-xs text-ink/50">{r.city} · {r.stay}</span></span>
                <Stars value={r.rating} size={12} />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-10 text-center"><Link to="/reviews" className="btn-outline">Read all reviews <ArrowRight size={16} /></Link></div>
    </section>
  );
}

function Location() {
  const { resort } = useCatalog();
  return (
    <section className="section bg-white">
      <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col justify-center">
          <Reveal><span className="eyebrow">Location</span></Reveal>
          <Reveal delay={0.05}><h2 className="mt-4 text-4xl font-semibold leading-[1.05] md:text-5xl">Steps from <em className="text-gradient-sea">Sunset Point</em></h2></Reveal>
          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-4">
              {[
                [MapPin, resort.address],
                [Phone, resort.phone],
                [Clock, `Check-in ${resort.checkIn} · Check-out ${resort.checkOut}`],
                [Waves, '2 min walk to the beach · 3 km from Kanyakumari Jn'],
              ].map(([Icon, text]) => (
                <li key={text} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-600"><Icon size={18} /></span>
                  <span className="pt-2.5 text-ink/70">{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.15} className="mt-8 flex gap-3">
            <Link to="/contact" className="btn-dark">Get directions</Link>
            <Link to="/transport" className="btn-outline">Book a pickup</Link>
          </Reveal>
        </div>
        <Reveal className="overflow-hidden rounded-[2rem] shadow-lift ring-1 ring-ink/5">
          <iframe title="Resort location map" src={`https://www.google.com/maps?q=${encodeURIComponent(resort.mapQuery)}&output=embed`} className="h-[420px] w-full grayscale-[30%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </Reveal>
      </div>
    </section>
  );
}

function CTA() {
  const { openBooking } = useBooking();
  return (
    <section className="px-3 py-10 sm:px-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-ink px-6 py-20 text-center text-white md:py-28">
        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative">
          <Reveal><h2 className="mx-auto max-w-3xl text-5xl font-semibold leading-[1] md:text-7xl">Your sunrise is <em className="text-gradient">waiting</em>.</h2></Reveal>
          <Reveal delay={0.1}><p className="mx-auto mt-6 max-w-lg text-white/70">Book direct for the best price, free breakfast and complimentary sunrise point transfers.</p></Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-wrap justify-center gap-3">
            <button onClick={() => openBooking({ type: 'room' })} className="btn-primary px-8 py-4 text-base">Book Now</button>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="btn-glass px-8 py-4 text-base">WhatsApp us</a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Explore />
      <RoomsPreview />
      <FoodSection />
      <PackageRing />
      <Activities />
      <OffersStrip />
      <ReviewsSection />
      <Location />
      <CTA />
    </>
  );
}
