import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tabs } from '../components/ui.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { api } from '@shared/lib/api.js';
import { describe } from '@shared/lib/describe.js';
import { cn, fmtDate, inr } from '@shared/lib/format.js';
import { AdminHeader, Panel, StatusChip, Th, TYPE_LABEL } from './adminUi.jsx';

const TYPES = [{ value: 'all', label: 'All' }, ...Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label }))];

export default function Bookings() {
  const catalog = useCatalog();
  const [list, setList] = useState(null);
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    api('/admin/bookings').then(setList).catch((e) => toast.error(e.message));
  }, []);

  const rows = useMemo(() => (list || []).filter((b) => {
    const text = `${b.invoiceNo} ${b.title} ${b.user?.name} ${b.user?.email} ${b.user?.phone}`.toLowerCase();
    return (type === 'all' || b.type === type) && (status === 'all' || b.status === status) && text.includes(q.toLowerCase());
  }), [list, type, status, q]);

  const update = async (b, next) => {
    if (next === 'cancelled' && !confirm(`Cancel ${b.invoiceNo}? Payment will be marked refunded.`)) return;
    setBusy(b._id);
    try {
      const updated = await api(`/admin/bookings/${b._id}`, { method: 'PATCH', body: { status: next } });
      setList((l) => l.map((x) => (x._id === b._id ? updated : x)));
      toast.success(`${b.invoiceNo} marked ${next}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const exportCsv = () => {
    const header = ['Invoice', 'Type', 'Item', 'Guest', 'Email', 'Phone', 'Details', 'Total', 'Payment', 'Status', 'Booked on'];
    const lines = rows.map((b) => [b.invoiceNo, b.type, b.title, b.user?.name, b.user?.email, b.user?.phone, describe(b, catalog), b.total, `${b.payment?.method} ${b.payment?.status}`, b.status, fmtDate(b.createdAt)]);
    const csv = [header, ...lines].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `bookings-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <AdminHeader
        title="Bookings"
        subtitle={list ? `${rows.length} of ${list.length} bookings · ${inr(rows.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.total, 0))} active revenue` : 'Loading…'}
        action={<button onClick={exportCsv} disabled={!rows.length} className="btn-outline"><Download size={16} /> Export CSV</button>}
      />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Tabs id="adm-type" options={TYPES} value={type} onChange={setType} />
        <div className="flex flex-1 gap-2 lg:justify-end">
          <label className="relative flex-1 lg:max-w-xs">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Guest, email, invoice…" aria-label="Search bookings" className="input rounded-full py-2.5 pl-10" />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto rounded-full py-2.5" aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Panel>
        {list === null ? (
          <div className="grid h-60 place-items-center"><Loader2 className="animate-spin text-ink/40" /></div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink/50">No bookings match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-sand"><tr><Th>Booking</Th><Th>Guest</Th><Th>Details</Th><Th className="text-right">Total</Th><Th>Payment</Th><Th>Status</Th></tr></thead>
              <tbody className="divide-y divide-ink/5">
                {rows.map((b) => (
                  <tr key={b._id} className={cn('align-top hover:bg-sand/40', b.status === 'cancelled' && 'opacity-60')}>
                    <td className="px-4 py-4">
                      <div className="flex gap-3">
                        <img src={b.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                        <div>
                          <p className="font-semibold">{b.title}</p>
                          <p className="font-mono text-xs text-ink/45">{b.invoiceNo} · {TYPE_LABEL[b.type]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold">{b.user?.name || '—'}</p>
                      <p className="text-xs text-ink/50">{b.user?.email}</p>
                      {b.user?.phone && <a href={`tel:${b.user.phone.replace(/\s/g, '')}`} className="text-xs text-teal-700 hover:underline">{b.user.phone}</a>}
                    </td>
                    <td className="max-w-xs px-4 py-4 text-xs text-ink/60">
                      {describe(b, catalog)}
                      {b.details?.request && <p className="mt-1 italic">“{b.details.request}”</p>}
                      {b.details?.notes && <p className="mt-1 italic">“{b.details.notes}”</p>}
                      <p className="mt-1 text-ink/40">Booked {fmtDate(b.createdAt)}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <p className="font-bold">{inr(b.total)}</p>
                      {b.coupon && <p className="text-xs text-emerald-600">{b.coupon} −{inr(b.discount)}</p>}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <p className="font-semibold uppercase">{b.payment?.method}</p>
                      <p className="capitalize text-ink/50">{b.payment?.method === 'resort' && b.payment?.status === 'paid' ? 'due at resort' : b.payment?.status}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <StatusChip status={b.status} />
                        {busy === b._id ? (
                          <Loader2 size={16} className="animate-spin text-ink/40" />
                        ) : (
                          <select value={b.status} onChange={(e) => update(b, e.target.value)} className="rounded-lg border border-ink/10 bg-white px-2 py-1 text-xs" aria-label={`Change status of ${b.invoiceNo}`}>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
