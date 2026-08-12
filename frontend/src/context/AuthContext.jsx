import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn: clerkIsSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const [localUser, setLocalUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medifly_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(localStorage.getItem('medifly_token') || null);
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('medifly_active_role') || 'user';
  });

  // Derived effective user from Clerk or local fallback
  const user = useMemo(() => {
    if (clerkIsSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || `${clerkUser.id}@medifly.com`;
      const name = clerkUser.fullName || clerkUser.firstName || email.split('@')[0];
      const roleFromMeta = clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role || 'user';

      return {
        id: clerkUser.id,
        _id: clerkUser.id,
        name: name,
        email: email,
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || '9876543210',
        role: roleFromMeta,
        isSubscribed: true,
        clerkUser: clerkUser
      };
    }
    return localUser;
  }, [clerkIsSignedIn, clerkUser, localUser]);

  const switchRole = async (newRole) => {
    localStorage.setItem('medifly_active_role', newRole);
    setActiveRole(newRole);

    if (clerkUser) {
      try {
        await clerkUser.update({
          unsafeMetadata: {
            ...clerkUser.unsafeMetadata,
            role: newRole
          }
        });
      } catch (err) {
        console.warn('Clerk metadata role update:', err.message);
      }
    }

    if (localUser) {
      const updated = { ...localUser, role: newRole };
      setLocalUser(updated);
      localStorage.setItem('medifly_user', JSON.stringify(updated));
    }
  };

  const logout = async () => {
    if (clerkIsSignedIn) {
      try {
        await clerkSignOut();
      } catch (err) {
        console.warn('Clerk signOut error:', err.message);
      }
    }
    setLocalUser(null);
    setToken(null);
    localStorage.removeItem('medifly_user');
    localStorage.removeItem('medifly_token');
    localStorage.removeItem('medifly_active_role');
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

    setLocalUser(userData);
    localStorage.setItem('medifly_user', JSON.stringify(userData));
    localStorage.setItem('medifly_active_role', role);
    return userData;
  };

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

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading: !clerkLoaded,
      logout,
      demoLogin,
      switchRole,
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
