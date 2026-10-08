import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

// Catalogue documents use readable string ids (e.g. "pool-villa") so the
// client fallback data and MongoDB stay interchangeable.
const catalog = (fields) => new Schema({ _id: String, ...fields }, opts);

export const Room = model('Room', catalog({
  name: String, type: String, tag: String, price: Number, capacity: Number, size: Number,
  bed: String, view: String, rating: Number, totalUnits: Number, description: String,
  amenities: [String], images: [String],
}));

export const MenuItem = model('MenuItem', catalog({
  name: String, category: String, price: Number, veg: Boolean, spicy: Number,
  popular: Boolean, description: String, image: String,
}));

export const Package = model('Package', catalog({
  name: String, destination: String, duration: String, days: Number, price: Number, rating: Number,
  tag: String, image: String, places: [String], includes: [String],
  itinerary: [{ _id: false, time: String, title: String, detail: String }],
}));

export const Vehicle = model('Vehicle', catalog({
  name: String, example: String, seats: Number, bags: Number, ac: Boolean, perKm: Number, base: Number, image: String,
}));

export const TransportService = model('TransportService', catalog({
  name: String, icon: String, image: String, description: String,
  routes: [{ _id: false, id: String, name: String, km: Number }],
}));

export const Offer = model('Offer', catalog({
  code: { type: String, unique: true }, title: String, description: String, category: String, type: String,
  value: Number, minAmount: Number, maxDiscount: Number, validTill: String, seasonal: Boolean, image: String, color: String,
}));

export const GalleryItem = model('GalleryItem', catalog({ category: String, title: String, src: String, video: String }));

export const Review = model('Review', new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String, city: String, avatar: String, rating: { type: Number, min: 1, max: 5 }, date: String,
  stay: String, title: String, text: String, photos: [String], verified: Boolean,
}, opts));

export const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  city: String,
  role: { type: String, enum: ['guest', 'admin'], default: 'guest' },
  password: { type: String, required: true, select: false },
}, opts));

export const Booking = model('Booking', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['room', 'food', 'tour', 'cab'], required: true },
  title: String,
  image: String,
  details: Schema.Types.Mixed,
  subtotal: Number,
  discount: Number,
  tax: Number,
  total: Number,
  coupon: String,
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  payment: { method: String, status: String, txnId: String, paidAt: Date },
  invoiceNo: String,
}, opts));

export const Message = model('Message', new Schema({ name: String, email: String, phone: String, message: String }, opts));
