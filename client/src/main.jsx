import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CatalogProvider } from './context/CatalogContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { BookingProvider } from './context/BookingContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogProvider>
        <AuthProvider>
          <CartProvider>
            <BookingProvider>
              <App />
            </BookingProvider>
          </CartProvider>
        </AuthProvider>
      </CatalogProvider>
    </BrowserRouter>
  </StrictMode>,
);
