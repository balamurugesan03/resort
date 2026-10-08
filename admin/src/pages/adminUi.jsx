import { CircleCheck, CircleX, Clock } from 'lucide-react';
import { cn } from '@shared/lib/format.js';

export const TYPE_LABEL = { room: 'Room', food: 'Food', tour: 'Tour', cab: 'Cab' };

export function AdminHeader({ title, subtitle, action }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

// Status always carries an icon + label, never colour alone.
const STATUS = {
  confirmed: ['bg-emerald-50 text-emerald-700', Clock, 'Confirmed'],
  completed: ['bg-sky-50 text-sky-700', CircleCheck, 'Completed'],
  cancelled: ['bg-rose-50 text-rose-600', CircleX, 'Cancelled'],
};
export function StatusChip({ status }) {
  const [cls, Icon, label] = STATUS[status] || STATUS.confirmed;
  return <span className={cn('chip shrink-0', cls)}><Icon size={12} /> {label}</span>;
}

export function Panel({ children, className }) {
  return <div className={cn('overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-ink/5', className)}>{children}</div>;
}

export function Th({ children, className }) {
  return <th className={cn('whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink/50', className)}>{children}</th>;
}
