import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function PageHero({ title, highlight, subtitle, image, children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[62vh] items-end overflow-hidden bg-ink pb-16 pt-36 md:min-h-[70vh] md:pb-20">
      <motion.img src={image} alt="" style={{ y, scale }} className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
      <div className="absolute -bottom-px left-0 right-0 -z-10 h-24 bg-gradient-to-t from-sand to-transparent" />
      <motion.div style={{ opacity: fade }} className="container-x">
        <nav className="mb-5 flex items-center gap-1.5 text-sm text-white/60" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight size={14} />
          <span className="text-white">{title}{highlight ? ` ${highlight}` : ''}</span>
        </nav>
        <motion.h1
          initial={{ opacity: 0, y: 40, rotateX: -30 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformPerspective: 800 }}
          className="max-w-4xl text-5xl font-semibold leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-8xl"
        >
          {title} {highlight && <em className="text-gradient not-italic">{highlight}</em>}
        </motion.h1>
        {subtitle && (
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }} className="mt-6 max-w-xl text-lg text-white/75">
            {subtitle}
          </motion.p>
        )}
        {children}
      </motion.div>
    </section>
  );
}
