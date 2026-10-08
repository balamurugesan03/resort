import { useState } from 'react';
import { Ban, Car, Clock, Dog, Loader2, LogIn, LogOut, Mail, MapPin, Phone, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHero from '../components/PageHero.jsx';
import { Reveal } from '../components/ui.jsx';
import { WhatsApp } from '../components/BrandIcons.jsx';
import TiltCard from '../components/TiltCard.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '@shared/lib/api.js';

export default function Contact() {
  const { resort } = useCatalog();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', message: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api('/contact', { method: 'POST', body: form });
      toast.success(r.message);
      setForm((f) => ({ ...f, message: '' }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const channels = [
    { icon: Phone, label: 'Call us', value: resort.phone, href: `tel:${resort.phone.replace(/\s/g, '')}`, color: 'from-teal-400 to-sky-600' },
    { icon: WhatsApp, label: 'WhatsApp', value: 'Chat instantly', href: `https://wa.me/${resort.whatsapp}?text=${encodeURIComponent('Hi Sagara Shores! I have a question about booking.')}`, color: 'from-emerald-400 to-green-600' },
    { icon: Mail, label: 'Email', value: resort.email, href: `mailto:${resort.email}`, color: 'from-amber-400 to-rose-500' },
    { icon: MapPin, label: 'Visit', value: 'Beach Road, Kanyakumari', href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resort.mapQuery)}`, color: 'from-violet-400 to-fuchsia-600' },
  ];

  return (
    <>
      <PageHero title="Contact &" highlight="Location" subtitle="Our front desk is open 24 × 7. Call, WhatsApp or drop us a note — we usually reply within minutes." image="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2000&q=80" />

      <section className="container-x pb-16 pt-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <TiltCard className="rounded-[1.75rem]">
                <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="block h-full rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-ink/5">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white ${c.color}`} style={{ transform: 'translateZ(30px)' }}><c.icon size={22} /></span>
                  <p className="mt-5 text-sm text-ink/50">{c.label}</p>
                  <p className="mt-0.5 break-words font-bold">{c.value}</p>
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-6 pb-24 lg:grid-cols-[1.3fr_1fr]">
        <Reveal className="overflow-hidden rounded-[2rem] shadow-lift ring-1 ring-ink/5">
          <iframe title="Google map of Sagara Shores" src={`https://www.google.com/maps?q=${encodeURIComponent(resort.mapQuery)}&output=embed`} className="h-full min-h-[460px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </Reveal>
        <div className="space-y-6">
          <Reveal className="rounded-[2rem] bg-ink p-7 text-white">
            <h2 className="text-2xl font-semibold">Check-in & policies</h2>
            <ul className="mt-5 space-y-4 text-sm">
              {[
                [LogIn, `Check-in from ${resort.checkIn}`, 'Valid photo ID (Aadhaar / passport) required'],
                [LogOut, `Check-out by ${resort.checkOut}`, 'Late check-out till 2 PM on request'],
                [Clock, '24 × 7 front desk', 'Early arrivals can relax in our lounge'],
                [Car, 'Free parking', 'Covered parking for 40 cars'],
                [Dog, 'Pets on request', 'Garden cottages only'],
                [Ban, 'Free cancellation', 'Up to 48 hours before check-in'],
              ].map(([Icon, t, d]) => (
                <li key={t} className="flex gap-3">
                  <Icon size={18} className="mt-0.5 shrink-0 text-teal-300" />
                  <span><span className="block font-semibold">{t}</span><span className="text-white/55">{d}</span></span>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex gap-2 border-t border-white/10 pt-5 text-sm text-white/70"><MapPin size={16} className="mt-0.5 shrink-0 text-teal-300" /> {resort.address}</p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-x max-w-3xl">
          <Reveal className="text-center">
            <span className="eyebrow">Write to us</span>
            <h2 className="mt-4 text-4xl font-semibold md:text-5xl">Questions? We’re all ears.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <form onSubmit={submit} className="mt-10 grid gap-4 sm:grid-cols-2">
              <label><span className="label">Name *</span><input required className="input" value={form.name} onChange={set('name')} autoComplete="name" /></label>
              <label><span className="label">Email *</span><input required type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" /></label>
              <label className="sm:col-span-2"><span className="label">Phone</span><input className="input" value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>
              <label className="sm:col-span-2"><span className="label">Message *</span><textarea required rows={5} className="input resize-none" value={form.message} onChange={set('message')} placeholder="Group bookings, events, special requests…" /></label>
              <button className="btn-primary py-4 sm:col-span-2" disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send message</button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
