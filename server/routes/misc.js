import { Router } from 'express';
import { Review, Message } from '../models.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/reviews', async (_req, res) => {
  res.json(await Review.find().sort({ date: -1, createdAt: -1 }).lean());
});

router.post('/reviews', requireAuth, async (req, res) => {
  const { rating, title, text, stay, photos = [] } = req.body;
  if (!rating || !text) return res.status(400).json({ message: 'Rating and review text are required' });
  const review = await Review.create({
    user: req.user._id, name: req.user.name, city: req.user.city, rating, title, text, stay,
    photos: photos.filter((p) => /^https?:\/\//.test(p)).slice(0, 4),
    date: new Date().toISOString().slice(0, 10), verified: true,
  });
  res.status(201).json(review);
});

router.post('/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: 'Please fill in name, email and message' });
  await Message.create({ name, email, phone, message });
  res.status(201).json({ message: 'Thanks! Our team will get back to you within a few hours.' });
});

export default router;
