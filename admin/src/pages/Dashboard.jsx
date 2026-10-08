import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, CalendarCheck, IndianRupee, Loader2, Mail, ReceiptText, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@shared/lib/api.js';
import { cn, fmtDate, inr } from '@shared/lib/format.js';
import { AdminHeader, StatusChip } from './adminUi.jsx';

const BAR = '#0d9488'; // teal-600 — single series, so one hue
const TYPE_LABEL = { room: 'Rooms', food: 'Food', tour: 'Tours', cab: 'Cabs' };

const compact = (n) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${Math.round(n / 1000)}k` : `₹${n}`);

function niceMax(v) {
  if (v <= 0) return 1000;
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p) * p;
}

// Vertical bar chart: revenue per day. Hover/focus a column for the exact value.
function RevenueChart({ data }) {
  const [hover, setHover] = useState(null);
  const W = 720;
  const H = 240;
  const pad = { l: 48, r: 8, t: 12, b: 28 };
  const max = niceMax(Math.max(...data.map((d) => d.revenue)));
  const ticks = [0, 0.5, 1].map((f) => f * max);
  const step = (W - pad.l - pad.r) / data.length;
  const bw = Math.min(28, step * 0.6);
  const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const h = hover !== null ? data[hover] : null;

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Revenue over the last ${data.length} days, total ${inr(total)}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-ink/10" strokeWidth="1" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="fill-ink/45 text-[11px]">{compact(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + step * i + (step - bw) / 2;
          const top = y(d.revenue);
          const height = Math.max(0, H - pad.b - top);
          const r = Math.min(4, height);
          return (
            <g key={d.date}>
              {height > 0 && (
                <path
                  d={`M${x},${H - pad.b} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${H - pad.b} Z`}
                  fill={BAR}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              {((data.length - 1 - i) % 2 === 0 || data.length <= 7) && (
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="fill-ink/45 text-[11px]">{new Date(`${d.date}T00:00`).getDate()}</text>
              )}
              {/* Hit target spans the whole column, bigger than the mark. */}
              <rect x={pad.l + step * i} y={pad.t} width={step} height={H - pad.t - pad.b} fill="transparent" tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} aria-label={`${fmtDate(`${d.date}T00:00`)}: ${inr(d.revenue)} from ${d.count} bookings`} />
            </g>
          );
        })}
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="currentColor" className="text-ink/25" />
      </svg>
      {h && (
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-lift" style={{ left: `${((pad.l + step * hover + step / 2) / W) * 100}%` }}>
          <p className="text-white/60">{fmtDate(`${h.date}T00:00`, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          <p className="text-sm font-bold">{inr(h.revenue)}</p>
          <p className="text-white/60">{h.count} booking{h.count === 1 ? '' : 's'}</p>
        </div>
      )}
    </figure>
  );
}

// Horizontal bars, direct-labelled (category name + values), so no legend needed.
function TypeBars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  return (
    <ul className="space-y-4">
      {data.map((d) => (
        <li key={d.type} className="group" title={`${TYPE_LABEL[d.type]}: ${d.count} bookings, ${inr(d.revenue)}`}>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="font-semibold">{TYPE_LABEL[d.type]}</span>
            <span className="text-ink/55"><span className="font-semibold text-ink">{inr(d.revenue)}</span> · {d.count}</span>
          </div>
          <div className="h-2.5 rounded-full bg-ink/5">
            <div className="h-full rounded-full transition-all duration-700 group-hover:opacity-80" style={{ width: `${(d.revenue / max) * 100}%`, background: BAR, minWidth: d.revenue ? 6 : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([api('/admin/stats'), api('/admin/bookings')])
      .then(([s, b]) => {
        setStats(s);
        setRecent(b.slice(0, 6));
      })
      .catch((e) => toast.error(e.message));
  }, []);

  if (!stats) return <div className="grid h-80 place-items-center"><Loader2 className="animate-spin text-ink/40" /></div>;

  const tiles = [
    ['Revenue', inr(stats.revenue), IndianRupee, 'Excludes cancelled'],
    ['Bookings', stats.bookings, ReceiptText, `${stats.cancelled} cancelled`],
    ['Upcoming stays', stats.upcomingStays, BedDouble, 'Room check-ins ahead'],
    ['Avg. order', inr(stats.avgOrder), CalendarCheck, 'Per booking'],
    ['Customers', stats.users, Users, 'Registered accounts'],
    ['Messages', stats.messages, Mail, 'Contact form'],
  ];

  return (
    <>
      <AdminHeader title="Dashboard" subtitle={`Today · ${fmtDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}`} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map(([label, value, Icon, hint]) => (
          <div key={label} className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink/5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon size={18} /></span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink/50">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="text-xs text-ink/45">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink/5">
          <h2 className="font-sans text-lg font-bold">Revenue · last 14 days</h2>
          <p className="mb-4 text-sm text-ink/50">{inr(stats.revenueByDay.reduce((s, d) => s + d.revenue, 0))} from {stats.revenueByDay.reduce((s, d) => s + d.count, 0)} bookings</p>
          <RevenueChart data={stats.revenueByDay} />
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink/5">
          <h2 className="font-sans text-lg font-bold">Revenue by service</h2>
          <p className="mb-6 text-sm text-ink/50">Amount · number of bookings</p>
          <TypeBars data={stats.byType} />
        </section>
      </div>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sans text-lg font-bold">Recent bookings</h2>
          <Link to="/bookings" className="flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline">View all <ArrowRight size={14} /></Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/50">No bookings yet — make one from the website to see it here.</p>
        ) : (
          <ul className="divide-y divide-ink/5">
            {recent.map((b) => (
              <li key={b._id} className="flex items-center gap-4 py-3">
                <img src={b.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{b.title}</p>
                  <p className="truncate text-xs text-ink/50">{b.user?.name || 'Guest'} · {fmtDate(b.createdAt)}</p>
                </div>
                <StatusChip status={b.status} />
                <span className={cn('w-24 text-right text-sm font-bold', b.status === 'cancelled' && 'text-ink/40 line-through')}>{inr(b.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
