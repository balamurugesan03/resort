import { Router } from 'express';
import { Booking, MenuItem, Message, Offer, Package, Review, Room, User, Vehicle } from '../models.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { buildStats } from '../../shared/stats.js';

const router = Router();
router.use(requireAuth, requireAdmin);

// Editable catalogue collections, keyed by the URL segment the client uses.
const COLLECTIONS = { rooms: Room, menu: MenuItem, packages: Package, offers: Offer, vehicles: Vehicle };
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

router.get('/stats', async (_req, res) => {
  const [bookings, users, messages, reviews] = await Promise.all([
    Booking.find().lean(), User.countDocuments(), Message.countDocuments(), Review.countDocuments(),
  ]);
  res.json(buildStats(bookings, { users, messages, reviews }));
});

router.get('/bookings', async (_req, res) => {
  res.json(await Booking.find().sort({ createdAt: -1 }).populate('user', 'name email phone').lean());
});

router.patch('/bookings/:id', async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'completed', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.status = status;
  if (status === 'cancelled') booking.payment.status = 'refunded';
  await booking.save();
  res.json(await booking.populate('user', 'name email phone'));
});

router.get('/users', async (_req, res) => {
  const [users, counts] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    Booking.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: '$user', bookings: { $sum: 1 }, spent: { $sum: '$total' } } }]),
  ]);
  const byUser = Object.fromEntries(counts.map((c) => [String(c._id), c]));
  res.json(users.map((u) => ({ ...u, bookings: byUser[u._id]?.bookings || 0, spent: byUser[u._id]?.spent || 0 })));
});

router.get('/messages', async (_req, res) => res.json(await Message.find().sort({ createdAt: -1 }).lean()));

router.delete('/messages/:id', async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.delete('/reviews/:id', async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.post('/:collection', async (req, res) => {
  const Model = COLLECTIONS[req.params.collection];
  if (!Model) return res.status(404).json({ message: 'Unknown collection' });
  const _id = slug(req.body._id || req.body.code || req.body.name);
  if (!_id) return res.status(400).json({ message: 'Name is required' });
  if (await Model.exists({ _id })) return res.status(409).json({ message: `“${_id}” already exists` });
  res.status(201).json(await Model.create({ ...req.body, _id }));
});

router.put('/:collection/:id', async (req, res) => {
  const Model = COLLECTIONS[req.params.collection];
  if (!Model) return res.status(404).json({ message: 'Unknown collection' });
  const { _id, createdAt, updatedAt, ...fields } = req.body;
  const doc = await Model.findByIdAndUpdate(req.params.id, fields, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.delete('/:collection/:id', async (req, res) => {
  const Model = COLLECTIONS[req.params.collection];
  if (!Model) return res.status(404).json({ message: 'Unknown collection' });
  await Model.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
