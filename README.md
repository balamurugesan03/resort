# 🌅 Sagara Shores — MERN Resort Booking Website

A resort booking platform for a Kanyakumari beach resort, built with **MongoDB, Express, React (Vite) and Node**. The design is a trending glassmorphism style with **3D** effects: React Three Fiber glass shapes, 3D tilt cards, a 3D package carousel and flip coupons. All photos come from Unsplash.

## Features

| Page | What's inside |
|---|---|
| 🏠 Home | 3D hero (refractive glass shapes over the resort photo), booking search bar, video tour, stats, bento "explore" grid, rooms, food, **3D rotating tour carousel**, activities, offers, reviews marquee, map |
| 🛏️ Rooms | Filters (type, guests, budget, sort), room detail gallery, amenities, **live availability**, Book Now |
| 🍽️ Restaurant | Category tabs, veg filter, search, add to cart, cart drawer, order food (room service / dine-in / takeaway) |
| 🗺️ Tour Packages | Package cards, itinerary timeline, places covered, Book Package |
| 🚗 Transport | Airport / railway / sightseeing, vehicle options, live fare per route, Book Transport |
| 🎁 Offers | 3D flip coupon cards, countdown timers, copy code, category filters |
| 🖼️ Gallery | Masonry grid, category filters, lightbox (keyboard + swipe), videos |
| ⭐ Reviews | Rating summary + distribution, photo reviews, write a review |
| 📍 Contact | Google Map, phone, WhatsApp, email, check-in/out & policies, contact form |
| 👤 My Account | Room / Food / Tour / Cab bookings, Payments, printable Invoices, Profile, cancel booking |
| 🛠️ Admin panel (/admin) | Dashboard (revenue, bookings, stats, charts), all bookings with status change and CSV export, add/edit/delete rooms, menu, packages, offers and vehicles (changes go live instantly), customers, contact messages, review moderation |
| 🤖 AI Chatbot | "Kumari" concierge: understands guests, nights, budget, destinations (plus Tanglish like *saapadu*, *rendu peru*) and replies with bookable rooms and packages |

The booking flow for every type is: details → coupon → payment (UPI / Card / Pay at resort, **simulated**) → confirmation with invoice number. Prices, coupons and GST are recalculated on the server.

## Run it

```bash
npm run install:all        # installs root + server + client

# 1) Configure the API (a MongoDB Atlas URI works too)
#    server/.env is already created — edit MONGO_URI if needed

npm run dev                # API on :5000 + web on :5173
```

Open http://localhost:5173. Demo logins: guest **demo@sagarashores.in / demo123** · admin **admin@sagarashores.in / admin123** (open http://localhost:5173/admin). Both demo users and all catalogue data are seeded automatically on first start. Run `npm run seed` to reset the catalogue.

> **No MongoDB yet?** Just run `npm run dev --prefix client`. When the API is unreachable, the site switches to **demo mode**: the same API runs in the browser, and bookings are saved in localStorage. Every page still works.

## Structure

```
shared/        data.js (rooms, menu, packages, cabs, offers, gallery, reviews) + pricing.js
               ↳ used by BOTH server (seed + price validation) and client (instant render, offline fallback)
server/        Express 5 + Mongoose · JWT auth · routes/ (auth, catalog, bookings, misc)
client/src/
  components/  Hero3D (R3F), TiltCard, BookingModal, Chatbot, CartDrawer, Navbar, …
  pages/       Home, Rooms, Restaurant, Packages, Transport, Offers, Gallery, Reviews, Contact, Account, Login
  lib/         api.js (fetch + demo fallback), mock.js, assistant.js (chatbot brain)
  context/     Catalog, Auth, Cart, Booking
```

## API

`POST /api/auth/register|login` · `GET/PUT /api/auth/me` · `GET /api/rooms|menu|packages|vehicles|transport|offers|gallery|reviews` · `GET /api/rooms/:id/availability?checkIn&checkOut` · `POST /api/coupons/validate` · `POST /api/bookings` · `GET /api/bookings/mine` · `PATCH /api/bookings/:id/cancel` · `POST /api/reviews` · `POST /api/contact`

Admin only (JWT + role=admin): `GET /api/admin/stats|bookings|users|messages` · `PATCH /api/admin/bookings/:id` · `POST /api/admin/:collection` · `PUT|DELETE /api/admin/:collection/:id` (rooms, menu, packages, offers, vehicles) · `DELETE /api/admin/reviews/:id|messages/:id`

## Going to production

- Swap the simulated payment in `server/routes/bookings.js` for Razorpay or Stripe.
- Change the admin password (`admin123`) right after the first deploy. A change-password screen is not built yet.
- Replace the resort name, phone, WhatsApp number and address in `shared/data.js`. The current values are placeholders.
- The chatbot is rule-based. To use an LLM, call it from a new server route and keep `assistant.js` as the fallback.
