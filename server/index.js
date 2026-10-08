import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB, seed } from './db.js';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import bookingRoutes from './routes/bookings.js';
import miscRoutes from './routes/misc.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api', bookingRoutes);
app.use('/api', miscRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
});

const port = process.env.PORT || 5000;
await connectDB(process.env.MONGO_URI);
await seed();
app.listen(port, () => console.log(`API ready → http://localhost:${port}/api`));
