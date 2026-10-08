import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from './ui.jsx';
import { Facebook, Instagram, WhatsApp, Youtube } from './BrandIcons.jsx';
import { ADMIN_URL, NAV } from './Navbar.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

export default function Footer() {
  const { resort } = useCatalog();
  return (
    <footer className="no-print relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="container-x relative pb-10 pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">{resort.tagline}. A boutique beach resort at the southern tip of India.</p>
            <div className="mt-6 flex gap-2">
              {[[Instagram, 'Instagram'], [Facebook, 'Facebook'], [Youtube, 'YouTube'], [WhatsApp, 'WhatsApp']].map(([Icon, label]) => (
                <a key={label} href={label === 'WhatsApp' ? `https://wa.me/${resort.whatsapp}` : '#'} target="_blank" rel="noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/15">
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-sans text-sm font-bold uppercase tracking-widest text-white/40">Explore</h4>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-white/70 lg:grid-cols-1">
              {NAV.slice(1, 7).map(([to, label]) => <li key={to}><Link to={to} className="hover:text-white">{label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-bold uppercase tracking-widest text-white/40">Visit</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-teal-300" /> {resort.address}</li>
              <li className="flex gap-3"><Phone size={16} className="shrink-0 text-teal-300" /> <a href={`tel:${resort.phone.replace(/\s/g, '')}`} className="hover:text-white">{resort.phone}</a></li>
              <li className="flex gap-3"><Mail size={16} className="shrink-0 text-teal-300" /> <a href={`mailto:${resort.email}`} className="hover:text-white">{resort.email}</a></li>
              <li className="flex gap-3"><Clock size={16} className="shrink-0 text-teal-300" /> Check-in {resort.checkIn} · out {resort.checkOut}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-bold uppercase tracking-widest text-white/40">Get secret deals</h4>
            <p className="mt-5 text-sm text-white/60">Members get up to 30% off and early access to seasonal offers.</p>
            <form onSubmit={(e) => { e.preventDefault(); e.target.reset(); toast.success('Subscribed! Watch your inbox 🌅'); }} className="mt-4 flex rounded-full bg-white/5 p-1.5 ring-1 ring-white/10 focus-within:ring-teal-400">
              <input type="email" required placeholder="Email address" aria-label="Email address" className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none" />
              <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-r from-amber-400 to-rose-500" aria-label="Subscribe"><ArrowRight size={18} /></button>
            </form>
          </div>
        </div>
        <p className="pointer-events-none mt-16 select-none bg-gradient-to-b from-white/15 to-transparent bg-clip-text text-center font-display text-[18vw] font-semibold leading-none text-transparent lg:text-[13rem]">Sagara</p>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Sagara Shores Resort. All rights reserved.</p>
          <p>Photos from Unsplash · Built with MERN + React Three Fiber · <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="hover:text-white">Staff login</a></p>
        </div>
      </div>
    </footer>
  );
}
