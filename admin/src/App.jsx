import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BedDouble, Car, ExternalLink, FlaskConical, Gift, LayoutDashboard, Loader2, LogOut, Mail, Map, MessageSquareQuote, ReceiptText, Sparkles, Users, UtensilsCrossed,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Logo } from './components/ui.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { isDemoMode, onDemoMode } from '@shared/lib/api.js';
import { cn } from '@shared/lib/format.js';
import Dashboard from './pages/Dashboard.jsx';
import Bookings from './pages/Bookings.jsx';
import CatalogManager from './pages/CatalogManager.jsx';
import { Messages, ReviewsAdmin, UsersAdmin } from './pages/People.jsx';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
const DEMO_ADMIN = { email: 'admin@sagarashores.in', password: 'admin123' };

const NAV = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/bookings', 'Bookings', ReceiptText],
  ['/rooms', 'Rooms', BedDouble],
  ['/menu', 'Food menu', UtensilsCrossed],
  ['/packages', 'Tour packages', Map],
  ['/offers', 'Offers', Gift],
  ['/vehicles', 'Vehicles', Car],
  ['/users', 'Customers', Users],
  ['/messages', 'Messages', Mail],
  ['/reviews', 'Reviews', MessageSquareQuote],
];

const toastOptions = { style: { borderRadius: '999px', background: '#0a1422', color: '#fff', fontSize: '14px', padding: '10px 18px' } };

function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (creds) => {
    setBusy(true);
    try {
      await login(creds.email, creds.password);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4 py-16">
      <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md rounded-[2rem] bg-sand p-7 shadow-2xl sm:p-9">
        <Logo />
        <h1 className="mt-8 text-3xl font-semibold">Admin login</h1>
        <p className="mb-6 mt-1 text-sm text-ink/60">Manage bookings, rooms, menu, tours, offers and guests.</p>
        <form onSubmit={(e) => { e.preventDefault(); submit(form); }} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" required autoComplete="username" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" required autoComplete="current-password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn-dark w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Log in</button>
        </form>
        <button onClick={() => submit(DEMO_ADMIN)} disabled={busy} className="btn-primary mt-3 w-full"><Sparkles size={16} /> Continue as demo admin</button>
      </motion.div>
    </section>
  );
}

function DemoBanner() {
  const [demo, setDemo] = useState(isDemoMode());
  useEffect(() => onDemoMode(() => setDemo(true)), []);
  if (!demo) return null;
  return (
    <p className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
      <FlaskConical size={18} className="mt-0.5 shrink-0" />
      <span><strong>Demo mode — backend offline.</strong> Data here is stored in this browser only, so bookings made on the website won’t appear. Start the API with MongoDB (<code>npm run dev</code>) to see live data.</span>
    </p>
  );
}

export default function App() {
  const { user, ready, logout } = useAuth();

  let content;
  if (!ready) content = <div className="grid min-h-screen place-items-center bg-ink"><Loader2 className="animate-spin text-white" /></div>;
  else if (!user) content = <Login />;
  else {
    content = (
      <div className="min-h-screen bg-sand lg:grid lg:grid-cols-[256px_1fr]">
        <aside className="sticky top-0 z-40 flex flex-col bg-ink text-white lg:h-screen">
          <div className="px-5 py-4 lg:py-6"><Logo light /></div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-y-auto">
            {NAV.map(([to, label, Icon]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn('flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition', isActive ? 'bg-white text-ink' : 'text-white/65 hover:bg-white/10 hover:text-white')}>
                <Icon size={17} /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden border-t border-white/10 p-3 lg:block">
            <div className="mb-2 flex items-center gap-3 px-2 py-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 text-sm font-bold">{user.name[0]}</span>
              <span className="min-w-0 text-sm"><span className="block truncate font-semibold">{user.name}</span><span className="block truncate text-xs text-white/50">{user.email}</span></span>
            </div>
            <a href={SITE_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/65 hover:bg-white/10 hover:text-white"><ExternalLink size={16} /> View website</a>
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-rose-300 hover:bg-white/10"><LogOut size={16} /> Log out</button>
          </div>
        </aside>
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <DemoBanner />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/users" element={<UsersAdmin />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/reviews" element={<ReviewsAdmin />} />
            <Route path="/:collection" element={<CatalogManager />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <>
      {content}
      <Toaster position="top-center" toastOptions={toastOptions} />
    </>
  );
}
