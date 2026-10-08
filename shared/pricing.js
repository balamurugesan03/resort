// Pricing rules shared by server (authoritative) and client (live preview).

export const TAX_RATE = 0.12;

export const nightsBetween = (checkIn, checkOut) => {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
};

export const cabFare = (vehicle, km, roundTrip = false) =>
  Math.round(vehicle.base + vehicle.perKm * km * (roundTrip ? 2 : 1));

// Returns { ok, discount, message } for a coupon against a category + subtotal.
export function applyCoupon(offer, category, subtotal) {
  if (!offer) return { ok: false, discount: 0, message: 'Invalid coupon code' };
  if (offer.category !== 'all' && offer.category !== category)
    return { ok: false, discount: 0, message: `${offer.code} is valid only on ${offer.category} bookings` };
  if (new Date(offer.validTill) < new Date(new Date().toDateString()))
    return { ok: false, discount: 0, message: `${offer.code} has expired` };
  if (subtotal < offer.minAmount)
    return { ok: false, discount: 0, message: `Minimum order ₹${offer.minAmount.toLocaleString('en-IN')} for ${offer.code}` };
  const raw = offer.type === 'percent' ? (subtotal * offer.value) / 100 : offer.value;
  const discount = Math.round(Math.min(raw, offer.maxDiscount ?? raw, subtotal));
  return { ok: true, discount, message: `${offer.code} applied — you save ₹${discount.toLocaleString('en-IN')}` };
}

export function totals(subtotal, discount = 0) {
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * TAX_RATE);
  return { subtotal, discount, tax, total: taxable + tax };
}

// Computes the subtotal for any booking type from catalogue data.
// Throws with a user-friendly message on invalid input.
export function quote(type, details, catalog) {
  switch (type) {
    case 'room': {
      const room = catalog.rooms.find((r) => r._id === details.roomId);
      if (!room) throw new Error('Room not found');
      const nights = nightsBetween(details.checkIn, details.checkOut);
      if (nights < 1) throw new Error('Check-out must be after check-in');
      const roomsCount = Math.max(1, Number(details.rooms) || 1);
      if (Number(details.guests) > room.capacity * roomsCount)
        throw new Error(`${room.name} fits ${room.capacity} guests per room — add another room`);
      return { title: `${room.name} · ${nights} night${nights > 1 ? 's' : ''}`, subtotal: room.price * nights * roomsCount, image: room.images[0] };
    }
    case 'food': {
      const lines = (details.items || []).map((line) => {
        const item = catalog.menu.find((m) => m._id === line.id);
        if (!item) throw new Error('Menu item not found');
        const qty = Math.max(1, Number(line.qty) || 1);
        return { id: item._id, name: item.name, price: item.price, qty };
      });
      if (!lines.length) throw new Error('Your cart is empty');
      details.items = lines;
      const count = lines.reduce((s, l) => s + l.qty, 0);
      return { title: `Food order · ${count} item${count > 1 ? 's' : ''}`, subtotal: lines.reduce((s, l) => s + l.price * l.qty, 0), image: catalog.menu.find((m) => m._id === lines[0].id).image };
    }
    case 'tour': {
      const pkg = catalog.packages.find((p) => p._id === details.packageId);
      if (!pkg) throw new Error('Package not found');
      const people = Math.max(1, Number(details.people) || 1);
      return { title: `${pkg.name} · ${people} pax`, subtotal: pkg.price * people, image: pkg.image };
    }
    case 'cab': {
      const vehicle = catalog.vehicles.find((v) => v._id === details.vehicleId);
      const service = catalog.transportServices.find((s) => s._id === details.serviceId);
      const route = service?.routes.find((r) => r.id === details.routeId);
      if (!vehicle || !service || !route) throw new Error('Choose a service, route and vehicle');
      return { title: `${service.name} · ${vehicle.name}`, subtotal: cabFare(vehicle, route.km, details.roundTrip), image: vehicle.image };
    }
    default:
      throw new Error('Unknown booking type');
  }
}
