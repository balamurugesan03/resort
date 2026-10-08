import mongoose from 'mongoose';
import { rooms, menu, packages, vehicles, transportServices, offers, gallery, reviews } from '../shared/data.js';
import bcrypt from 'bcryptjs';
import { Room, MenuItem, Package, Vehicle, TransportService, Offer, GalleryItem, Review, User } from './models.js';

const DEMO_USERS = [
  [{ name: 'Demo Guest', email: 'demo@sagarashores.in', phone: '+91 90000 00000', city: 'Chennai' }, 'demo123'],
  [{ name: 'Resort Admin', email: 'admin@sagarashores.in', phone: '+91 98765 43210', city: 'Kanyakumari', role: 'admin' }, 'admin123'],
];

const collections = [
  [Room, rooms], [MenuItem, menu], [Package, packages], [Vehicle, vehicles],
  [TransportService, transportServices], [Offer, offers], [GalleryItem, gallery], [Review, reviews],
];

export async function connectDB(uri) {
  await mongoose.connect(uri);
  console.log(`MongoDB connected → ${mongoose.connection.name}`);
}

// Seeds catalogue collections. Without `force`, only empty collections are filled.
// Demo logins are skipped in production; the first admin comes from ADMIN_EMAIL / ADMIN_PASSWORD instead.
export async function seed({ force = false, demoUsers = process.env.NODE_ENV !== 'production' } = {}) {
  for (const [Model, docs] of collections) {
    if (force) await Model.deleteMany({});
    else if (await Model.estimatedDocumentCount()) continue;
    await Model.insertMany(docs);
    console.log(`  seeded ${Model.modelName} (${docs.length})`);
  }
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD && !(await User.exists({ role: 'admin' }))) {
    if (ADMIN_PASSWORD.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters');
    await User.create({ name: 'Resort Admin', email: ADMIN_EMAIL, role: 'admin', password: await bcrypt.hash(ADMIN_PASSWORD, 10) });
    console.log(`  created admin ${ADMIN_EMAIL}`);
  }
  if (!demoUsers) return;
  for (const [user, password] of DEMO_USERS) {
    if (await User.exists({ email: user.email })) continue;
    await User.create({ ...user, password: await bcrypt.hash(password, 10) });
    console.log(`  seeded ${user.role || 'guest'} ${user.email} / ${password}`);
  }
}
