// Dashboard aggregates, shared by the admin API and the in-browser demo backend.

// Local calendar date (not UTC), so a 9 PM IST booking lands on today's bar.
const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

export function buildStats(bookings, { users = 0, messages = 0, reviews = 0, days = 14 } = {}) {
  const live = bookings.filter((b) => b.status !== 'cancelled');
  const revenue = live.reduce((s, b) => s + (b.total || 0), 0);

  const revenueByDay = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(d.getDate() - i);
    revenueByDay.push({ date: dayKey(d), revenue: 0, count: 0 });
  }
  const byDate = Object.fromEntries(revenueByDay.map((r) => [r.date, r]));
  for (const b of live) {
    const row = byDate[dayKey(b.createdAt)];
    if (row) {
      row.revenue += b.total || 0;
      row.count += 1;
    }
  }

  const byType = ['room', 'food', 'tour', 'cab'].map((type) => {
    const list = live.filter((b) => b.type === type);
    return { type, count: list.length, revenue: list.reduce((s, b) => s + (b.total || 0), 0) };
  });

  const today = dayKey(new Date());
  return {
    revenue,
    bookings: live.length,
    cancelled: bookings.length - live.length,
    upcomingStays: live.filter((b) => b.type === 'room' && b.details?.checkIn >= today).length,
    avgOrder: live.length ? Math.round(revenue / live.length) : 0,
    users,
    messages,
    reviews,
    revenueByDay,
    byType,
  };
}
