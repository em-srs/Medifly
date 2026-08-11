import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medifly_token') || null);
  const [loading, setLoading] = useState(true);

  // Helper for API requests
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const currentToken = localStorage.getItem('medifly_token');
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API Request failed');
    }
    return data;
  }, []);

  // Fetch profile on initial load if token exists
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('medifly_token');
      const savedUser = localStorage.getItem('medifly_user');

      if (savedToken) {
        try {
          const profile = await apiCall('/api/auth/profile');
          const userData = { ...profile, token: savedToken };
          setUser(userData);
          setToken(savedToken);
          localStorage.setItem('medifly_user', JSON.stringify(userData));
        } catch (err) {
          console.warn('Session verification failed, falling back to local user:', err.message);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } else if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, [apiCall]);

  const loginWithEmail = async (email, password) => {
    const data = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const userData = {
      id: data._id || data.id,
      _id: data._id || data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      token: data.token,
    };

    setUser(userData);
    setToken(data.token);
    localStorage.setItem('medifly_token', data.token);
    localStorage.setItem('medifly_user', JSON.stringify(userData));
    return userData;
  };

  const registerWithEmail = async ({ name, email, password, phone }) => {
    const data = await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });

    const userData = {
      id: data._id || data.id,
      _id: data._id || data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      token: data.token,
    };

    setUser(userData);
    setToken(data.token);
    localStorage.setItem('medifly_token', data.token);
    localStorage.setItem('medifly_user', JSON.stringify(userData));
    return userData;
  };

  const demoLogin = (role = 'user', phone = '9876543210') => {
    const roleNames = {
      admin: 'Platform Admin',
      pharmacy: 'MediFly Partner Pharmacy',
      rider: 'Fleet Rider',
      user: 'Patient User'
    };

    const userData = {
      id: 'USR-' + (role === 'admin' ? '1' : role === 'pharmacy' ? '2' : role === 'rider' ? '3' : '4'),
      _id: 'USR-' + (role === 'admin' ? '1' : role === 'pharmacy' ? '2' : role === 'rider' ? '3' : '4'),
      phone,
      email: `${role}@medifly.com`,
      name: roleNames[role] || 'User',
      role,
      isSubscribed: role === 'user',
      subscriptionPlan: role === 'user' ? 'yearly' : 'none',
      subscriptionExpiry: null,
      joinedAt: new Date().toISOString()
    };

    setUser(userData);
    localStorage.setItem('medifly_user', JSON.stringify(userData));
    return userData;
  };

  const login = (phone, role = 'user') => {
    return demoLogin(role, phone);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medifly_user');
    localStorage.removeItem('medifly_token');
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
      isSubscribed: true,
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
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      loginWithEmail,
      registerWithEmail,
      demoLogin,
      logout,
      subscribe,
      updateUser,
      apiCall
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
