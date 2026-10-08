import { Router } from 'express';
import { Room, MenuItem, Package, Vehicle, TransportService, Offer, GalleryItem, Booking } from '../models.js';
import { nightsBetween } from '../../shared/pricing.js';

const router = Router();
const list = (Model, sort = {}) => async (_req, res) => res.json(await Model.find().sort(sort).lean());

router.get('/rooms', list(Room, { price: 1 }));
router.get('/menu', list(MenuItem));
router.get('/packages', list(Package, { price: 1 }));
router.get('/vehicles', list(Vehicle, { perKm: 1 }));
router.get('/transport', list(TransportService));
router.get('/offers', list(Offer));
router.get('/gallery', list(GalleryItem));

router.get('/rooms/:id', async (req, res) => {
  const room = await Room.findById(req.params.id).lean();
  if (!room) return res.status(404).json({ message: 'Room not found' });
  res.json(room);
});

// Units left for a room type over a date range (overlapping, non-cancelled bookings).
export async function roomsLeft(room, checkIn, checkOut) {
  const overlapping = await Booking.find({
    type: 'room', status: { $ne: 'cancelled' }, 'details.roomId': room._id,
    'details.checkIn': { $lt: checkOut }, 'details.checkOut': { $gt: checkIn },
  }).lean();
  const booked = overlapping.reduce((sum, b) => sum + (Number(b.details.rooms) || 1), 0);
  return Math.max(0, room.totalUnits - booked);
}

router.get('/rooms/:id/availability', async (req, res) => {
  const { checkIn, checkOut } = req.query;
  const room = await Room.findById(req.params.id).lean();
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (nightsBetween(checkIn, checkOut) < 1) return res.status(400).json({ message: 'Check-out must be after check-in' });
  const left = await roomsLeft(room, checkIn, checkOut);
  res.json({ available: left > 0, roomsLeft: left });
});

export default router;
