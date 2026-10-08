import { fmtDate } from './format.js';

// One-line human summary of a booking's details, per booking type.
export function describe(b, catalog) {
  const d = b.details || {};
  switch (b.type) {
    case 'room': return `${fmtDate(d.checkIn)} → ${fmtDate(d.checkOut)} · ${d.guests} guests · ${d.rooms || 1} room(s)`;
    case 'tour': return `${fmtDate(d.date)} · ${d.people} people · pickup: ${d.pickup}`;
    case 'cab': {
      const s = catalog.transportServices.find((x) => x._id === d.serviceId);
      const r = s?.routes.find((x) => x.id === d.routeId);
      return `${fmtDate(d.date)} at ${d.time} · ${r?.name || ''}${d.roundTrip ? ' · round trip' : ''}`;
    }
    case 'food': return `${(d.items || []).map((i) => `${i.name || i.id} × ${i.qty}`).join(', ')} · ${d.orderType?.replace('-', ' ')}${d.roomNo ? ` (room ${d.roomNo})` : ''}`;
    default: return '';
  }
}
