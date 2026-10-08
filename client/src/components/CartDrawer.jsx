import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';
import { inr } from '@shared/lib/format.js';
import { Empty } from './ui.jsx';

export default function CartDrawer() {
  const cart = useCart();
  const { openBooking } = useBooking();
  return (
    <AnimatePresence>
      {cart.open && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => cart.setOpen(false)} />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col bg-sand shadow-2xl"
            aria-label="Your food cart"
          >
            <div className="flex items-center justify-between border-b border-ink/5 p-6">
              <h2 className="text-2xl font-semibold">Your order</h2>
              <button onClick={() => cart.setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm" aria-label="Close cart"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {cart.items.length === 0 ? (
                <Empty icon={ShoppingBag} title="Cart is empty" text="Add something delicious from our menu." action={<Link to="/restaurant" onClick={() => cart.setOpen(false)} className="btn-dark">Browse menu</Link>} />
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {cart.items.map((l) => (
                      <motion.li key={l._id} layout exit={{ opacity: 0, x: 40 }} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-ink/5">
                        <img src={l.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <p className="text-sm font-bold leading-snug">{l.name}</p>
                            <button onClick={() => cart.setQty(l._id, 0)} className="text-ink/30 hover:text-rose-500" aria-label={`Remove ${l.name}`}><Trash2 size={16} /></button>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-full bg-ink/5 p-0.5">
                              <button onClick={() => cart.setQty(l._id, l.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-white" aria-label="Decrease"><Minus size={13} /></button>
                              <span className="w-5 text-center text-sm font-bold">{l.qty}</span>
                              <button onClick={() => cart.setQty(l._id, l.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-white" aria-label="Increase"><Plus size={13} /></button>
                            </div>
                            <span className="font-bold">{inr(l.qty * l.price)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
            {cart.items.length > 0 && (
              <div className="border-t border-ink/5 bg-white p-6">
                <div className="flex justify-between text-sm text-ink/60"><span>Subtotal</span><span className="text-lg font-bold text-ink">{inr(cart.subtotal)}</span></div>
                <p className="mt-1 text-xs text-ink/40">Taxes & coupons applied at checkout</p>
                <button onClick={() => { cart.setOpen(false); openBooking({ type: 'food' }); }} className="btn-primary mt-4 w-full py-4 text-base">Checkout · Order food</button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
