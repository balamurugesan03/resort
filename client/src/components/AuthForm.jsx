import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { Tabs } from './ui.jsx';
import { DEMO_ENABLED } from '@shared/lib/api.js';

export const DEMO = { email: 'demo@sagarashores.in', password: 'demo123' };

export default function AuthForm({ onDone, compact }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e, creds) => {
    e?.preventDefault();
    setBusy(true);
    try {
      const user = mode === 'login' || creds ? await login((creds || form).email, (creds || form).password) : await register(form);
      toast.success(`Welcome${mode === 'register' ? '' : ' back'}, ${user.name.split(' ')[0]}!`);
      onDone?.(user);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Tabs id="auth" options={[{ value: 'login', label: 'Log in' }, { value: 'register', label: 'Create account' }]} value={mode} onChange={setMode} />
      <motion.form key={mode} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} onSubmit={submit} className={compact ? 'mt-5 space-y-3' : 'mt-7 space-y-4'}>
        {mode === 'register' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="af-name">Full name</label>
              <input id="af-name" className="input" required value={form.name} onChange={set('name')} placeholder="Your name" autoComplete="name" />
            </div>
            <div>
              <label className="label" htmlFor="af-phone">Phone</label>
              <input id="af-phone" className="input" value={form.phone} onChange={set('phone')} placeholder="+91" autoComplete="tel" />
            </div>
          </div>
        )}
        <div>
          <label className="label" htmlFor="af-email">Email</label>
          <input id="af-email" type="email" className="input" required value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="af-pass">Password</label>
          <input id="af-pass" type="password" className="input" required minLength={6} value={form.password} onChange={set('password')} placeholder="••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />}
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>
        {mode === 'login' && DEMO_ENABLED && (
          <button type="button" onClick={() => submit(null, DEMO)} disabled={busy} className="btn-outline w-full">
            <Sparkles size={16} className="text-amber-500" /> Continue with demo account
          </button>
        )}
      </motion.form>
    </div>
  );
}
