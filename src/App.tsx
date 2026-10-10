// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { ServiceCartProvider } from './context/ServiceCartContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRouter from './router/AppRouter';
import { ServiceQuerySession } from './modules/services/serviceQueries';

import { queryClient } from './queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <ServiceCartProvider>
                <ThemeProvider>
                  <ServiceQuerySession><AppRouter /></ServiceQuerySession>
                </ThemeProvider>
              </ServiceCartProvider>
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
