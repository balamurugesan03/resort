import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@shared/lib/format.js';

// Pointer-driven 3D tilt with a moving glare highlight.
export default function TiltCard({ children, className, max = 10, glare = true }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const spring = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(y, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(x, [0, 1], [-max, max]), spring);
  const gx = useTransform(x, (v) => `${v * 100}%`);
  const gy = useTransform(y, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.35), transparent 55%)`;

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div className="perspective h-full">
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn('group relative h-full', className)}
      >
        {children}
        {glare && <motion.div aria-hidden style={{ background: glareBg }} className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
      </motion.div>
    </div>
  );
}
