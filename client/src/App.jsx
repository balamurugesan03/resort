import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Chatbot from './components/Chatbot.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Home from './pages/Home.jsx';
import { onDemoMode } from '@shared/lib/api.js';

const Rooms = lazy(() => import('./pages/Rooms.jsx'));
const Restaurant = lazy(() => import('./pages/Restaurant.jsx'));
const Packages = lazy(() => import('./pages/Packages.jsx'));
const Transport = lazy(() => import('./pages/Transport.jsx'));
const Offers = lazy(() => import('./pages/Offers.jsx'));
const Gallery = lazy(() => import('./pages/Gallery.jsx'));
const Reviews = lazy(() => import('./pages/Reviews.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const toastOptions = { style: { borderRadius: '999px', background: '#0a1422', color: '#fff', fontSize: '14px', padding: '10px 18px' } };

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ scaleX }} className="no-print fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-teal-400 via-amber-400 to-rose-500" />;
}

const Loader = () => (
  <div className="grid min-h-screen place-items-center bg-ink">
    <span className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-400" />
  </div>
);

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  useEffect(() => onDemoMode(() => toast('Backend offline — running in demo mode. Bookings are saved in this browser.', { icon: '🧪', id: 'demo', duration: 6000 })), []);

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/restaurant" element={<Restaurant />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <Chatbot />
      <Toaster position="top-center" toastOptions={toastOptions} />
    </>
  );
}
