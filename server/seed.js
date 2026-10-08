import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, seed } from './db.js';

await connectDB(process.env.MONGO_URI);
await seed({ force: process.argv.includes('--force') });
await mongoose.disconnect();
console.log('Seed complete');
