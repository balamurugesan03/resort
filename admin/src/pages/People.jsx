import { useEffect, useMemo, useState } from 'react';
import { Loader2, Mail, Phone, Search, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Stars } from '../components/ui.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { api } from '@shared/lib/api.js';
import { fmtDate, inr } from '@shared/lib/format.js';
import { AdminHeader, Panel, Th } from './adminUi.jsx';

const Spinner = () => <div className="grid h-60 place-items-center"><Loader2 className="animate-spin text-ink/40" /></div>;

function useAdminList(path) {
  const [list, setList] = useState(null);
  useEffect(() => {
    api(path).then(setList).catch((e) => { toast.error(e.message); setList([]); });
  }, [path]);
  return [list, setList];
}

export function UsersAdmin() {
  const [users] = useAdminList('/admin/users');
  const [q, setQ] = useState('');
  const rows = useMemo(() => (users || []).filter((u) => `${u.name} ${u.email} ${u.phone} ${u.city}`.toLowerCase().includes(q.toLowerCase())), [users, q]);
  return (
    <>
      <AdminHeader title="Customers" subtitle={users ? `${users.length} registered accounts` : 'Loading…'} />
      <label className="relative mb-6 block max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, phone…" aria-label="Search customers" className="input rounded-full py-2.5 pl-10" />
      </label>
      <Panel>
        {!users ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-sand"><tr><Th>Customer</Th><Th>Contact</Th><Th>City</Th><Th className="text-right">Bookings</Th><Th className="text-right">Spent</Th><Th>Joined</Th></tr></thead>
              <tbody className="divide-y divide-ink/5">
                {rows.map((u) => (
                  <tr key={u._id} className="hover:bg-sand/40">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-600 text-sm font-bold text-white">{u.name[0]}</span>
                        <span className="font-semibold">{u.name}</span>
                        {u.role === 'admin' && <span className="chip bg-amber-50 text-amber-700"><ShieldCheck size={12} /> Admin</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs"><p>{u.email}</p><p className="text-ink/50">{u.phone || '—'}</p></td>
                    <td className="px-4 py-3.5 text-ink/60">{u.city || '—'}</td>
                    <td className="px-4 py-3.5 text-right font-semibold">{u.bookings}</td>
                    <td className="px-4 py-3.5 text-right font-semibold">{inr(u.spent)}</td>
                    <td className="px-4 py-3.5 text-ink/60">{fmtDate(u.createdAt)}</td>
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

export function Messages() {
  const [messages, setMessages] = useAdminList('/admin/messages');
  const remove = async (m) => {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    try {
      await api(`/admin/messages/${m._id}`, { method: 'DELETE' });
      setMessages((l) => l.filter((x) => x._id !== m._id));
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <>
      <AdminHeader title="Messages" subtitle="Enquiries from the contact form" />
      {!messages ? <Spinner /> : messages.length === 0 ? (
        <Panel className="py-16 text-center text-sm text-ink/50">No messages yet.</Panel>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <Panel key={m._id} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{m.name}</p>
                  <p className="text-xs text-ink/50">{fmtDate(m.createdAt, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your enquiry — Sagara Shores')}`} className="btn-outline px-4 py-2"><Mail size={15} /> Reply</a>
                  {m.phone && <a href={`tel:${m.phone.replace(/\s/g, '')}`} className="btn-outline px-4 py-2"><Phone size={15} /> Call</a>}
                  <button onClick={() => remove(m)} className="grid h-10 w-10 place-items-center rounded-full text-ink/50 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete message from ${m.name}`}><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/75">{m.message}</p>
              <p className="mt-3 text-xs text-ink/45">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}

export function ReviewsAdmin() {
  const { reviews, refresh } = useCatalog();
  const [busy, setBusy] = useState(null);
  const remove = async (r) => {
    if (!confirm(`Remove review by ${r.name}? It will be hidden from the website.`)) return;
    setBusy(r._id);
    try {
      await api(`/admin/reviews/${r._id}`, { method: 'DELETE' });
      await refresh('reviews');
      toast.success('Review removed');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <AdminHeader title="Reviews" subtitle={`${reviews.length} reviews · average ${(reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)).toFixed(1)} ★`} />
      <div className="grid gap-4 lg:grid-cols-2">
        {reviews.map((r) => (
          <Panel key={r._id} className="flex flex-col p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 font-bold text-teal-700">{r.name[0]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{r.name}</p>
                <p className="truncate text-xs text-ink/50">{[r.stay, fmtDate(r.date)].filter(Boolean).join(' · ')}</p>
              </div>
              <Stars value={r.rating} size={13} />
            </div>
            {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
            <p className="mt-1 line-clamp-3 text-sm text-ink/65">{r.text}</p>
            <div className="mt-auto flex justify-end pt-3">
              <button onClick={() => remove(r)} disabled={busy === r._id} className="btn px-4 py-2 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50">
                {busy === r._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Remove
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
