import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@shared/lib/format.js';

export function Reveal({ children, delay = 0, y = 32, className, as = 'div' }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', light, action }) {
  return (
    <div className={cn('mb-12 flex flex-col gap-6 md:mb-16', align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between')}>
      <Reveal className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <span className={cn('eyebrow', light && 'text-teal-300')}>{eyebrow}</span>}
        <h2 className={cn('mt-4 text-4xl font-semibold leading-[1.05] md:text-5xl lg:text-6xl', light ? 'text-white' : 'text-ink')}>{title}</h2>
        {subtitle && <p className={cn('mt-5 text-base leading-relaxed md:text-lg', light ? 'text-white/70' : 'text-ink/60')}>{subtitle}</p>}
      </Reveal>
      {action && <Reveal delay={0.1}>{action}</Reveal>}
    </div>
  );
}

export function Stars({ value = 5, size = 14, className }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-ink/10 text-ink/10'} />
      ))}
    </span>
  );
}

export function Counter({ value, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: 2, ease: 'easeOut', onUpdate: setDisplay });
    return () => controls.stop();
  }, [inView, value]);
  return (
    <span ref={ref}>
      {display.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export function Logo({ light }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Sagara Shores home">
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-ink shadow-lg ring-1 ring-white/10 transition-transform duration-500 group-hover:rotate-[8deg]">
        <span className="absolute top-1.5 h-5 w-5 rounded-full bg-gradient-to-br from-amber-300 to-rose-500" />
        <svg viewBox="0 0 40 16" className="absolute bottom-1.5 w-8" fill="none" strokeWidth="2.5" strokeLinecap="round">
          <path d="M2 6c4-3 6-3 9 0s6 3 9 0 6-3 9 0 6 3 9 0" stroke="#2dd4bf" />
          <path d="M2 12c4-3 6-3 9 0s6 3 9 0 6-3 9 0 6 3 9 0" stroke="#22d3ee" opacity=".6" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={cn('block font-display text-xl font-semibold tracking-tight', light ? 'text-white' : 'text-ink')}>Sagara Shores</span>
        <span className={cn('block text-[10px] font-semibold uppercase tracking-[0.3em]', light ? 'text-white/60' : 'text-ink/50')}>Kanyakumari</span>
      </span>
    </Link>
  );
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-ink/15 bg-white/60 px-6 py-16 text-center">
      {Icon && (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-600">
          <Icon size={26} />
        </span>
      )}
      <h3 className="text-xl font-semibold">{title}</h3>
      {text && <p className="mt-2 max-w-sm text-sm text-ink/60">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
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
