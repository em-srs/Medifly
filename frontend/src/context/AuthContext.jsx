import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('medifly_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = (phone, role = 'user') => {
    const userData = {
      id: 'USR-' + Date.now(),
      phone,
      name: role === 'admin' ? 'Admin User' : role === 'pharmacy' ? 'PharmaCare' : role === 'rider' ? 'Rider' : 'User',
      role,
      isSubscriber: false,
      subscribedAt: null,
      subscriptionPlan: null,
      subscriptionExpiry: null,
      joinedAt: new Date().toISOString()
    };
    setUser(userData);
    localStorage.setItem('medifly_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medifly_user');
  };

  const subscribe = (plan) => {
    const expiry = new Date();
    if (plan === 'monthly') {
      expiry.setMonth(expiry.getMonth() + 1);
    } else {
      expiry.setFullYear(expiry.getFullYear() + 1);
    }
    const updated = {
      ...user,
      isSubscriber: true,
      subscribedAt: new Date().toISOString(),
      subscriptionPlan: plan,
      subscriptionExpiry: expiry.toISOString()
    };
    setUser(updated);
    localStorage.setItem('medifly_user', JSON.stringify(updated));
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('medifly_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, subscribe, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
