import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Bot, Copy, Plus, Send, Sparkles, Star, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { respond } from '../lib/assistant.js';
import { cn, inr } from '@shared/lib/format.js';

const GREETING = {
  from: 'bot',
  text: 'Hi 👋 How can I help you?',
  chips: ['Room for 2 people for 2 nights and Kanyakumari sightseeing', 'Airport pickup', 'Today’s offers', 'Check-in time'],
};

export default function Chatbot() {
  const catalog = useCatalog();
  const { openBooking } = useBooking();
  const cart = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scroller = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const send = (text) => {
    const msg = text.trim();
    if (!msg || typing) return;
    setMessages((m) => [...m, { from: 'user', text: msg }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', ...respond(msg, catalog) }]);
      setTyping(false);
    }, 650 + Math.random() * 400);
  };

  const book = (type, item, context) => {
    const details = type === 'room'
      ? { checkIn: context.checkIn, checkOut: context.checkOut, guests: context.guests, rooms: context.rooms || 1 }
      : { people: context.guests, date: context.checkIn };
    openBooking({ type, item, details });
  };

  return (
    <div className="no-print">
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full bg-ink p-2 text-white 2xl:pr-5 shadow-lift ring-1 ring-white/10"
            aria-label="Open AI concierge chat"
          >
            <span className="relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-teal-400 via-sky-500 to-violet-500">
              <span className="absolute inset-0 animate-ping rounded-full bg-teal-400/40" />
              <Sparkles size={20} className="relative" />
            </span>
            <span className="hidden text-left text-sm leading-tight 2xl:block">
              <span className="block font-bold">Ask Kumari</span>
              <span className="block text-xs text-white/60">AI concierge · online</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 40, scale: 0.9, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            style={{ transformPerspective: 1000, transformOrigin: 'bottom right' }}
            className="fixed inset-x-3 bottom-3 z-[60] flex h-[min(640px,calc(100svh-24px))] flex-col overflow-hidden rounded-[2rem] bg-sand shadow-2xl ring-1 ring-ink/10 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[400px]"
            aria-label="AI concierge chat"
          >
            <header className="relative flex items-center gap-3 overflow-hidden bg-ink px-5 py-4 text-white">
              <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-teal-500/30 blur-2xl" />
              <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 via-sky-500 to-violet-500"><Bot size={22} /></span>
              <div className="relative flex-1">
                <p className="font-bold">Kumari · AI Concierge</p>
                <p className="flex items-center gap-1.5 text-xs text-white/60"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Replies instantly</p>
              </div>
              <button onClick={() => setOpen(false)} className="relative grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close chat"><X size={18} /></button>
            </header>

            <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex flex-col gap-2', m.from === 'user' ? 'items-end' : 'items-start')}>
                  <p className={cn('max-w-[85%] whitespace-pre-line rounded-3xl px-4 py-3 text-sm leading-relaxed', m.from === 'user' ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md bg-white shadow-sm ring-1 ring-ink/5')}>{m.text}</p>

                  {m.rooms?.length > 0 && (
                    <Carousel>
                      {m.rooms.map((r) => (
                        <MiniCard key={r._id} image={r.images[0]} title={r.name} meta={<><Users size={11} /> {r.capacity} · <Star size={11} className="fill-amber-400 text-amber-400" /> {r.rating}</>} price={`${inr(r.price)}/night`} onBook={() => book('room', r, m.context)} />
                      ))}
                    </Carousel>
                  )}
                  {m.packages?.length > 0 && (
                    <Carousel>
                      {m.packages.map((p) => (
                        <MiniCard key={p._id} image={p.image} title={p.name} meta={p.duration} price={`${inr(p.price)}/person`} onBook={() => book('tour', p, m.context)} />
                      ))}
                    </Carousel>
                  )}
                  {m.menu?.length > 0 && (
                    <Carousel>
                      {m.menu.map((f) => (
                        <MiniCard key={f._id} image={f.image} title={f.name} meta={f.category} price={inr(f.price)} cta={<><Plus size={12} /> Add</>} onBook={() => cart.add(f)} />
                      ))}
                    </Carousel>
                  )}
                  {m.offers?.length > 0 && (
                    <div className="w-full space-y-2">
                      {m.offers.map((o) => (
                        <button key={o.code} onClick={() => { navigator.clipboard?.writeText(o.code); toast.success(`${o.code} copied`); }} className={cn('flex w-full items-center justify-between rounded-2xl bg-gradient-to-r p-3 text-left text-white', o.color)}>
                          <span className="text-sm font-semibold">{o.title}</span>
                          <span className="flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 font-mono text-xs font-bold">{o.code} <Copy size={11} /></span>
                        </button>
                      ))}
                    </div>
                  )}
                  {m.links?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {m.links.map((l) => l.href ? (
                        <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="chip bg-emerald-500 py-2 text-white">{l.label} <ArrowUpRight size={12} /></a>
                      ) : (
                        <button key={l.label} onClick={() => { navigate(l.to); setOpen(false); }} className="chip bg-ink py-2 text-white">{l.label} <ArrowUpRight size={12} /></button>
                      ))}
                    </div>
                  )}
                  {m.chips?.length > 0 && i === messages.length - 1 && (
                    <div className="flex flex-wrap gap-2">
                      {m.chips.map((c) => (
                        <button key={c} onClick={() => send(c)} className="chip bg-white py-2 text-ink ring-1 ring-ink/10 transition hover:bg-teal-50 hover:ring-teal-300">{c}</button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <div className="flex w-16 gap-1 rounded-3xl rounded-bl-md bg-white px-4 py-4 shadow-sm">
                  {[0, 1, 2].map((d) => <motion.span key={d} className="h-2 w-2 rounded-full bg-ink/40" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }} />)}
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-ink/5 bg-white p-3">
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about rooms, food, tours…" aria-label="Message" className="min-w-0 flex-1 rounded-full bg-sand px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
              <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-white disabled:opacity-40" disabled={!input.trim() || typing} aria-label="Send"><Send size={17} /></button>
            </form>
            <p className="bg-white pb-2 text-center text-[10px] text-ink/40">Need a human? <Link to="/contact" onClick={() => setOpen(false)} className="underline">Contact the front desk</Link></p>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function Carousel({ children }) {
  return <div className="no-scrollbar -mx-4 flex w-[calc(100%+2rem)] snap-x gap-3 overflow-x-auto px-4 pb-1">{children}</div>;
}

function MiniCard({ image, title, meta, price, onBook, cta = 'Book Now' }) {
  return (
    <div className="w-48 shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
      <img src={image} alt="" className="h-24 w-full object-cover" />
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-bold">{title}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink/50">{meta}</p>
        <div className="mt-2 flex items-center justify-between gap-1">
          <span className="text-xs font-bold">{price}</span>
          <button onClick={onBook} className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-2.5 py-1 text-[11px] font-bold text-white">{cta}</button>
        </div>
      </div>
    </div>
  );
}
