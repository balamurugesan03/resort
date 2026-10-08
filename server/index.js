import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { connectDB, seed } from './db.js';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import bookingRoutes from './routes/bookings.js';
import miscRoutes from './routes/misc.js';
import adminRoutes from './routes/admin.js';

const isProd = process.env.NODE_ENV === 'production';
// Sub-path the whole app lives under, e.g. "/resort" for https://unizova.com/resort. Empty in dev.
const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');

if (isProd) {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 32 || secret.startsWith('change-me')) throw new Error('Set JWT_SECRET to a random string of 32+ characters');
  if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI');
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(isProd ? 'combined' : 'dev'));

const api = express.Router();
api.get('/health', (_req, res) => res.json({ ok: true }));
api.use('/auth', authRoutes);
api.use('/', catalogRoutes);
api.use('/', bookingRoutes);
api.use('/', miscRoutes);
api.use('/admin', adminRoutes);
api.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use(`${BASE}/api`, api);

// Serve the built website and admin panel (run `npm run build` first). Unknown paths fall back to
// each app's index.html so client-side routes like /resort/rooms survive a page refresh.
const serveSpa = (mount, dir) => {
  if (!existsSync(dir)) return;
  app.use(mount, express.static(dir, { index: false, maxAge: '1y', immutable: true }));
  app.get(`${mount}{/*path}`, (_req, res) => res.set('Cache-Control', 'no-cache').sendFile('index.html', { root: dir }));
};
serveSpa(`${BASE}/admin`, fileURLToPath(new URL('../admin/dist', import.meta.url)));
serveSpa(BASE || '/', fileURLToPath(new URL('../client/dist', import.meta.url)));

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: status >= 500 && isProd ? 'Something went wrong' : err.message || 'Something went wrong' });
});

const port = process.env.PORT || 5000;
await connectDB(process.env.MONGO_URI);
await seed({ demoUsers: !isProd });
app.listen(port, () => console.log(`API ready → http://localhost:${port}${BASE}/api`));
