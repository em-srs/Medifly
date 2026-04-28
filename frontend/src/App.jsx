import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }   from '@/context/AuthContext';
import { CartProvider }   from '@/context/CartContext';
import { SocketProvider } from '@/context/SocketContext';
import Header      from '@/components/Header';
import Footer      from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';

// Pages
import HomePage         from '@/pages/HomePage';
import MedicinesPage    from '@/pages/MedicinesPage';
import AboutPage        from '@/pages/AboutPage';
import ContactPage      from '@/pages/ContactPage';
import LoginPage        from '@/pages/LoginPage';
import DashboardPage    from '@/pages/DashboardPage';
import ProfilePage      from '@/pages/ProfilePage';
import CheckoutPage     from '@/pages/CheckoutPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import SaltComparePage  from '@/pages/SaltComparePage';
import PrescriptionsPage from '@/pages/PrescriptionsPage';
import OrdersPage       from '@/pages/OrdersPage';
import SettingsPage     from '@/pages/SettingsPage';
import AdminPage        from '@/pages/AdminPage';
import PharmacyPage     from '@/pages/PharmacyPage';
import RiderPage        from '@/pages/RiderPage';

function Layout({ children }) {
  return (
    <>
      <Header />
      <CartSidebar />
      <main style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <Layout>
              <Routes>
                <Route path="/"             element={<HomePage />} />
                <Route path="/medicines"    element={<MedicinesPage />} />
                <Route path="/about"        element={<AboutPage />} />
                <Route path="/contact"      element={<ContactPage />} />
                <Route path="/login"        element={<LoginPage />} />
                <Route path="/dashboard"    element={<DashboardPage />} />
                <Route path="/profile"      element={<ProfilePage />} />
                <Route path="/checkout"     element={<CheckoutPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/salt-compare" element={<SaltComparePage />} />
                <Route path="/prescriptions" element={<PrescriptionsPage />} />
                <Route path="/orders"       element={<OrdersPage />} />
                <Route path="/settings"     element={<SettingsPage />} />
                <Route path="/admin"        element={<AdminPage />} />
                <Route path="/pharmacy"     element={<PharmacyPage />} />
                <Route path="/rider"        element={<RiderPage />} />
              </Routes>
            </Layout>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
