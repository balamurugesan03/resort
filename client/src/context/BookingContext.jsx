import { createContext, lazy, Suspense, useContext, useState } from 'react';

const BookingModal = lazy(() => import('../components/BookingModal.jsx'));
const BookingContext = createContext(null);

// openBooking({ type: 'room' | 'tour' | 'cab' | 'food', item?, details? })
export function BookingProvider({ children }) {
  const [request, setRequest] = useState(null);
  return (
    <BookingContext.Provider value={{ openBooking: setRequest }}>
      {children}
      {request && (
        <Suspense fallback={null}>
          <BookingModal request={request} onClose={() => setRequest(null)} />
        </Suspense>
      )}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
