import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@shared/lib/format.js';

export function Stars({ value = 5, size = 14, className }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-ink/10 text-ink/10'} />
      ))}
    </span>
  );
}

export function Logo({ light }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Admin dashboard">
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-ink ring-1 ring-white/10">
        <span className="absolute top-1.5 h-5 w-5 rounded-full bg-gradient-to-br from-amber-300 to-rose-500" />
        <svg viewBox="0 0 40 16" className="absolute bottom-1.5 w-8" fill="none" strokeWidth="2.5" strokeLinecap="round">
          <path d="M2 6c4-3 6-3 9 0s6 3 9 0 6-3 9 0 6 3 9 0" stroke="#2dd4bf" />
          <path d="M2 12c4-3 6-3 9 0s6 3 9 0 6-3 9 0 6 3 9 0" stroke="#22d3ee" opacity=".6" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={cn('block font-display text-xl font-semibold tracking-tight', light ? 'text-white' : 'text-ink')}>Sagara Shores</span>
        <span className={cn('block text-[10px] font-semibold uppercase tracking-[0.3em]', light ? 'text-amber-300' : 'text-amber-600')}>Admin</span>
      </span>
    </Link>
  );
}

export function Tabs({ options, value, onChange, className, id = 'tabs' }) {
  return (
    <div className={cn('no-scrollbar flex gap-2 overflow-x-auto pb-1', className)}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const active = v === value;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn('relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors', active ? 'text-white' : 'bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink')}
          >
            {active && <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
