export const inr = (n) =>
  `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

export const fmtDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-IN', opts) : '—';

export const isoDate = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return isoDate(x);
};

export const today = () => isoDate(new Date());

export const cn = (...c) => c.filter(Boolean).join(' ');
