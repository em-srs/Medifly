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

  const [dbUser, setDbUser] = useState(null);

  // Sync Clerk user with PostgreSQL backend
  useEffect(() => {
    let isMounted = true;
    if (clerkIsSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || `${clerkUser.id}@medifly.com`;
      const name = clerkUser.fullName || clerkUser.firstName || email.split('@')[0];
      const phone = clerkUser.primaryPhoneNumber?.phoneNumber || null;

      fetch(`${API_BASE}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          email,
          name,
          phone
        })
      })
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.token) {
            setToken(data.token);
            localStorage.setItem('medifly_token', data.token);
            if (data.user) {
              setDbUser(data.user);
            }
          }
        })
        .catch(err => console.warn('Failed to sync Clerk user with backend:', err.message));
    }
    return () => { isMounted = false; };
  }, [clerkIsSignedIn, clerkUser]);

  // Derived effective user from Clerk or local fallback
  // IMPORTANT: role comes from dbUser (server-sourced via DB), never from client Clerk metadata
  const user = useMemo(() => {
    if (clerkIsSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || `${clerkUser.id}@medifly.com`;
      const name = clerkUser.fullName || clerkUser.firstName || email.split('@')[0];

      return {
        id: dbUser?.id || clerkUser.id,
        _id: dbUser?.id || clerkUser.id,
        patientId: dbUser?.patientId || `MF-${String(dbUser?.id || '1').padStart(5, '0')}-A`,
        name: dbUser?.name || name,
        email: dbUser?.email || email,
        phone: dbUser?.phone || clerkUser.primaryPhoneNumber?.phoneNumber || '',
        altPhone: dbUser?.altPhone || '',
        bloodGroup: dbUser?.bloodGroup || '',
        allergies: dbUser?.allergies || '',
        primaryDoctor: dbUser?.primaryDoctor || '',
        street: dbUser?.street || '',
        city: dbUser?.city || '',
        state: dbUser?.state || '',
        zipCode: dbUser?.zipCode || '',
        upiId: dbUser?.upiId || '',
        role: dbUser?.role || 'user',
        isSubscribed: dbUser ? dbUser.isSubscribed : false,
        subscriptionPlan: dbUser?.subscriptionPlan || 'none',
        createdAt: dbUser?.createdAt || clerkUser.createdAt,
        token: token,
        clerkUser: clerkUser
      };
    }
    return localUser ? { ...localUser, token } : null;
  }, [clerkIsSignedIn, clerkUser, dbUser, localUser, token]);

  // switchRole is intentionally removed — roles are assigned server-side
  // in PostgreSQL only (via direct DB UPDATE), never client-switchable.
  const switchRole = () => {
    console.warn('Role switching is disabled. Roles are assigned server-side only.');
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
    setDbUser(null);
    setToken(null);
    localStorage.removeItem('medifly_user');
    localStorage.removeItem('medifly_token');
    localStorage.removeItem('medifly_active_role');
  };

  const demoLogin = (role = 'user', phone = '') => {
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
    if (clerkUser?.id) {
      headers['X-Clerk-Id'] = clerkUser.id;
    }
    if (clerkUser?.primaryEmailAddress?.emailAddress) {
      headers['X-User-Email'] = clerkUser.primaryEmailAddress.emailAddress;
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
  }, [clerkUser]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      setDbUser,
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
