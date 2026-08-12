import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }   from '@/context/AuthContext';
import { CartProvider }   from '@/context/CartContext';
import { SocketProvider } from '@/context/SocketContext';
import Header      from '@/components/Header';
import Footer      from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import HomePage         from '@/pages/HomePage';
import MedicinesPage    from '@/pages/MedicinesPage';
import AboutPage        from '@/pages/AboutPage';
import ContactPage      from '@/pages/ContactPage';
import LoginPage        from '@/pages/LoginPage';
import PartnerApplyPage from '@/pages/PartnerApplyPage';
import RiderApplyPage   from '@/pages/RiderApplyPage';
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
                {/* Public Routes */}
                <Route path="/"              element={<HomePage />} />
                <Route path="/medicines"     element={<MedicinesPage />} />
                <Route path="/about"         element={<AboutPage />} />
                <Route path="/contact"       element={<ContactPage />} />
                <Route path="/login"         element={<LoginPage />} />
                <Route path="/salt-compare"  element={<SaltComparePage />} />
                <Route path="/partner/apply" element={<PartnerApplyPage />} />
                <Route path="/rider/apply"   element={<RiderApplyPage />} />

                {/* Patient / Authenticated User Protected Routes */}
                <Route path="/dashboard"    element={<ProtectedRoute allowedRoles={['user', 'pharmacy', 'rider', 'admin']}><DashboardPage /></ProtectedRoute>} />
                <Route path="/profile"      element={<ProtectedRoute allowedRoles={['user', 'pharmacy', 'rider', 'admin']}><ProfilePage /></ProtectedRoute>} />
                <Route path="/checkout"     element={<ProtectedRoute allowedRoles={['user', 'pharmacy', 'rider', 'admin']}><CheckoutPage /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute allowedRoles={['user', 'admin']}><SubscriptionPage /></ProtectedRoute>} />
                <Route path="/prescriptions" element={<ProtectedRoute allowedRoles={['user', 'pharmacy', 'admin']}><PrescriptionsPage /></ProtectedRoute>} />
                <Route path="/orders"       element={<ProtectedRoute allowedRoles={['user', 'pharmacy', 'rider', 'admin']}><OrdersPage /></ProtectedRoute>} />
                <Route path="/settings"     element={<ProtectedRoute allowedRoles={['user', 'pharmacy', 'rider', 'admin']}><SettingsPage /></ProtectedRoute>} />

                {/* Role-Specific Protected Dashboards */}
                <Route path="/admin"        element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
                <Route path="/pharmacy"     element={<ProtectedRoute allowedRoles={['pharmacy', 'admin']}><PharmacyPage /></ProtectedRoute>} />
                <Route path="/rider"        element={<ProtectedRoute allowedRoles={['rider', 'admin']}><RiderPage /></ProtectedRoute>} />
              </Routes>
            </Layout>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
