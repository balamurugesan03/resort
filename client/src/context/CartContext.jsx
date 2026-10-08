import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const KEY = 'ss-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const value = useMemo(() => {
    const setQty = (id, qty) =>
      setItems((list) => (qty <= 0 ? list.filter((l) => l._id !== id) : list.map((l) => (l._id === id ? { ...l, qty } : l))));
    return {
      items,
      open,
      setOpen,
      count: items.reduce((s, l) => s + l.qty, 0),
      subtotal: items.reduce((s, l) => s + l.qty * l.price, 0),
      qtyOf: (id) => items.find((l) => l._id === id)?.qty || 0,
      add: (item) => {
        setItems((list) => {
          const found = list.find((l) => l._id === item._id);
          return found ? list.map((l) => (l._id === item._id ? { ...l, qty: l.qty + 1 } : l)) : [...list, { _id: item._id, name: item.name, price: item.price, image: item.image, veg: item.veg, qty: 1 }];
        });
        toast.success(`${item.name} added`, { id: `cart-${item._id}` });
      },
      setQty,
      clear: () => setItems([]),
    };
  }, [items, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
