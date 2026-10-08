import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, phone: u.phone, city: u.city, role: u.role || 'guest', createdAt: u.createdAt });

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists' });
  const user = await User.create({ name, email, phone, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password || '', user.password)))
    return res.status(401).json({ message: 'Incorrect email or password' });
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => res.json(publicUser(req.user)));

router.put('/me', requireAuth, async (req, res) => {
  const { name, phone, city } = req.body;
  Object.assign(req.user, { name: name || req.user.name, phone, city });
  await req.user.save();
  res.json(publicUser(req.user));
});

export default router;
