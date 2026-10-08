import jwt from 'jsonwebtoken';
import { User } from '../models.js';

export const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, '');
  if (!token) return res.status(401).json({ message: 'Please log in to continue' });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) throw new Error('missing user');
    next();
  } catch {
    res.status(401).json({ message: 'Session expired — please log in again' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
}
