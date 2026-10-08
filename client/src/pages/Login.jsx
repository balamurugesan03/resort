import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, Receipt, UtensilsCrossed } from 'lucide-react';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const next = state?.from || '/account';
  useEffect(() => { if (user) navigate(next, { replace: true }); }, [user, navigate, next]);

  return (
    <section className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <motion.img initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2 }} src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-14 text-white">
          <h2 className="text-5xl font-semibold leading-tight">Your stay,<br /><em className="text-gradient">all in one place</em>.</h2>
          <ul className="mt-8 space-y-3 text-white/80">
            {[[BedDouble, 'Manage room, tour & cab bookings'], [UtensilsCrossed, 'Track food orders & room service'], [Receipt, 'Download invoices anytime']].map(([Icon, t]) => (
              <li key={t} className="flex items-center gap-3"><span className="glass grid h-9 w-9 place-items-center rounded-xl"><Icon size={16} /></span>{t}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 pb-16 pt-32 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-4xl font-semibold">Welcome to Sagara Shores</h1>
          <p className="mb-8 mt-2 text-ink/60">Log in or create an account to book and manage your trip.</p>
          <AuthForm onDone={() => navigate(next, { replace: true })} />
        </motion.div>
      </div>
    </section>
  );
}
