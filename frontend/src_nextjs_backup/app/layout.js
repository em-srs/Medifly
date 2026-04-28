import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { SocketProvider } from '@/context/SocketContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';

export const metadata = {
  title: 'MediFly — Medicines Delivered in 1–6 Hours',
  description: 'MediFly is a hyperlocal medicine delivery platform delivering medicines within 1-6 hours. Fast, verified, and reliable healthcare at your doorstep.',
  keywords: 'medicine delivery, pharmacy, healthcare, quick commerce, prescription, auto refill',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>
            <CartProvider>
              <Header />
              <CartSidebar />
              <main style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
                {children}
              </main>
              <Footer />
            </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
