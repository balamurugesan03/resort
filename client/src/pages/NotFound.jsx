import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4 text-center text-white">
      <img src="https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=2000&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="relative">
        <motion.p animate={{ y: [0, -16, 0], rotateZ: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="font-display text-[10rem] font-semibold leading-none text-gradient">404</motion.p>
        <h1 className="text-3xl font-semibold">Lost at sea?</h1>
        <p className="mt-2 text-white/60">This page drifted away. Let’s get you back to shore.</p>
        <Link to="/" className="btn-primary mt-8">Back to home</Link>
      </div>
    </section>
  );
}
