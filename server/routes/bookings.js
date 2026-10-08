import { Router } from 'express';
import { Room, MenuItem, Package, Vehicle, TransportService, Offer, Booking } from '../models.js';
import { requireAuth } from '../middleware/auth.js';
import { quote, applyCoupon, totals } from '../../shared/pricing.js';
import { roomsLeft } from './catalog.js';

const router = Router();

async function loadCatalog() {
  const [rooms, menu, packages, vehicles, transportServices] = await Promise.all(
    [Room, MenuItem, Package, Vehicle, TransportService].map((M) => M.find().lean()),
  );
  return { rooms, menu, packages, vehicles, transportServices };
}

async function price(type, details, code) {
  const q = quote(type, details, await loadCatalog());
  let discount = 0;
  let coupon;
  if (code) {
    const offer = await Offer.findOne({ code: String(code).toUpperCase() }).lean();
    const result = applyCoupon(offer, type, q.subtotal);
    if (!result.ok) throw Object.assign(new Error(result.message), { status: 400 });
    discount = result.discount;
    coupon = offer.code;
  }
  return { ...q, ...totals(q.subtotal, discount), coupon };
}

router.post('/coupons/validate', async (req, res) => {
  const { code, category, amount } = req.body;
  const offer = await Offer.findOne({ code: String(code || '').toUpperCase() }).lean();
  const result = applyCoupon(offer, category, Number(amount) || 0);
  res.status(result.ok ? 200 : 400).json(result);
});

router.post('/bookings', requireAuth, async (req, res) => {
  const { type, details = {}, coupon, paymentMethod = 'upi' } = req.body;
  let priced;
  try {
    priced = await price(type, details, coupon);
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message });
  }
  if (type === 'room') {
    const room = await Room.findById(details.roomId).lean();
    const left = await roomsLeft(room, details.checkIn, details.checkOut);
    if (left < (Number(details.rooms) || 1))
      return res.status(409).json({ message: `Only ${left} ${room.name} left for those dates` });
  }
  const count = await Booking.countDocuments();
  const booking = await Booking.create({
    user: req.user._id, type, details, title: priced.title, image: priced.image,
    subtotal: priced.subtotal, discount: priced.discount, tax: priced.tax, total: priced.total, coupon: priced.coupon,
    // Payment gateway is simulated — swap in Razorpay/Stripe here for production.
    payment: { method: paymentMethod, status: 'paid', txnId: `TXN${Date.now().toString(36).toUpperCase()}`, paidAt: new Date() },
    invoiceNo: `SS-${new Date().getFullYear()}-${String(count + 1001).padStart(5, '0')}`,
  });
  res.status(201).json(booking);
});

router.get('/bookings/mine', requireAuth, async (req, res) => {
  res.json(await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).lean());
});

router.patch('/bookings/:id/cancel', requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.status = 'cancelled';
  booking.payment.status = 'refunded';
  await booking.save();
  res.json(booking);
});

export default router;
