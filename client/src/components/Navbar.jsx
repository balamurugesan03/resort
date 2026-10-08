import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LayoutDashboard, LogOut, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { Logo } from './ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { cn } from '@shared/lib/format.js';

// The admin panel is a separate app (see /admin in the repo).
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

export const NAV = [
  ['/', 'Home'], ['/rooms', 'Rooms'], ['/restaurant', 'Restaurant'], ['/packages', 'Tour Packages'], ['/transport', 'Transport'],
  ['/offers', 'Offers'], ['/gallery', 'Gallery'], ['/reviews', 'Reviews'], ['/contact', 'Contact'],
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { user, logout } = useAuth();
  const cart = useCart();
  const { openBooking } = useBooking();
  const { pathname } = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); setMenu(false); }, [pathname]);
  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const solid = scrolled || open;
  return (
    <header className="no-print fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5',
          solid ? 'border border-white/60 bg-white/80 shadow-soft backdrop-blur-xl' : 'border border-white/15 bg-white/5 backdrop-blur-md',
        )}
      >
        <Logo light={!solid} />

        <ul className="hidden items-center gap-0.5 xl:flex">
          {NAV.map(([to, label]) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'} className={({ isActive }) => cn('relative rounded-full px-3 py-2 text-[13px] font-semibold transition-colors', solid ? 'text-ink/70 hover:text-ink' : 'text-white/80 hover:text-white', isActive && (solid ? 'text-ink' : 'text-white'))}>
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="nav-pill" className={cn('absolute inset-0 rounded-full', solid ? 'bg-ink/5' : 'bg-white/15')} transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }} />}
                    <span className="relative">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {cart.count > 0 && (
            <button onClick={() => cart.setOpen(true)} className={cn('relative grid h-10 w-10 place-items-center rounded-full transition', solid ? 'bg-ink/5 text-ink hover:bg-ink/10' : 'bg-white/10 text-white hover:bg-white/20')} aria-label={`Cart, ${cart.count} items`}>
              <ShoppingBag size={18} />
              <motion.span key={cart.count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{cart.count}</motion.span>
            </button>
          )}
          {user ? (
            <div ref={menuRef} className="relative hidden sm:block">
              <button onClick={() => setMenu((m) => !m)} className={cn('flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold transition', solid ? 'bg-ink/5 text-ink' : 'bg-white/10 text-white')}>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-teal-400 to-sky-600 text-xs font-bold text-white">{user.name[0]}</span>
                {user.name.split(' ')[0]} <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-ink/5">
                    <Link to="/account" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-ink/5"><UserRound size={16} /> My Account</Link>
                    {user.role === 'admin' && <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-ink/5"><LayoutDashboard size={16} /> Admin panel</a>}
                    <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"><LogOut size={16} /> Log out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className={cn('hidden rounded-full px-4 py-2.5 text-sm font-semibold transition sm:block', solid ? 'text-ink hover:bg-ink/5' : 'text-white hover:bg-white/10')}>Login</Link>
          )}
          <button onClick={() => openBooking({ type: 'room' })} className="btn-primary hidden px-5 py-2.5 sm:inline-flex">Book Now</button>
          <button onClick={() => setOpen((o) => !o)} className={cn('grid h-10 w-10 place-items-center rounded-full xl:hidden', solid ? 'bg-ink text-white' : 'bg-white text-ink')} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mx-auto mt-2 max-h-[calc(100svh-90px)] max-w-7xl overflow-y-auto rounded-[2rem] bg-white/95 p-4 shadow-lift backdrop-blur-xl xl:hidden">
            <ul className="grid grid-cols-2 gap-1">
              {NAV.map(([to, label], i) => (
                <motion.li key={to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <NavLink to={to} end={to === '/'} className={({ isActive }) => cn('block rounded-2xl px-4 py-3 text-base font-semibold', isActive ? 'bg-ink text-white' : 'text-ink hover:bg-ink/5')}>{label}</NavLink>
                </motion.li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink/5 pt-3">
              {user ? (
                <>
                  <Link to="/account" className="btn-outline">My Account</Link>
                  {user.role === 'admin' && <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="btn-outline col-span-2">Admin panel</a>}
                  <button onClick={logout} className="btn-outline text-rose-600">Log out</button>
                </>
              ) : (
                <Link to="/login" className="btn-outline">Login</Link>
              )}
              <button onClick={() => { setOpen(false); openBooking({ type: 'room' }); }} className={cn('btn-primary', user && 'col-span-2')}>Book Now</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
