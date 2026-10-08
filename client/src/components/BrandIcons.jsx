// Minimal brand marks (lucide v1 ships no brand icons).
const base = (size) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' });

export const Instagram = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
);
export const Facebook = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z" /></svg>
);
export const Youtube = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" /></svg>
);
export const WhatsApp = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.6z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.3-2-1-.9.8a4 4 0 0 1-2.3-2.3l.8-.9-1-2L9 9.5z" fill="currentColor" stroke="none" /></svg>
);
