import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import styles from './PrescriptionsPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { User, Home, ShoppingBag, Folder, Settings, Pencil, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Not specified'];

export default function ProfilePage() {
  const pathname = useLocation().pathname;
  const contentRef = useScrollReveal(0.05);
  const { user: authUser, apiCall, setDbUser } = useAuth();

  const [profile, setProfile] = useState(authUser || null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    altPhone: '',
    bloodGroup: 'Not specified',
    allergies: '',
    primaryDoctor: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    upiId: ''
  });

  // Fetch authentic user profile from GET /api/users/me
  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        setLoading(true);
        const data = await apiCall('/api/users/me');
        if (isMounted) {
          setProfile(data);
          if (setDbUser) setDbUser(data);
        }
      } catch (err) {
        console.warn('Could not fetch profile from GET /api/users/me:', err.message);
        if (isMounted && authUser) {
          setProfile(authUser);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfile();
    return () => { isMounted = false; };
  }, [apiCall, authUser, setDbUser]);

  const openEditModal = () => {
    if (!profile) return;
    setEditForm({
      name: profile.name || '',
      phone: profile.phone || '',
      altPhone: profile.altPhone || '',
      bloodGroup: profile.bloodGroup || 'Not specified',
      allergies: profile.allergies || '',
      primaryDoctor: profile.primaryDoctor || '',
      street: profile.street || '',
      city: profile.city || '',
      state: profile.state || '',
      zipCode: profile.zipCode || '',
      upiId: profile.upiId || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await apiCall('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setProfile(updated);
      if (setDbUser) setDbUser(updated);
      setIsEditing(false);
      setToastMsg('Profile updated successfully!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (err) {
      setToastMsg(`Error updating profile: ${err.message}`);
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  const patientId = profile?.patientId || (profile?.id ? `MF-${String(profile.id).padStart(5, '0')}-A` : 'MF-00001-A');

  return (
    <div className={styles.layout}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#0f172a',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          <Check size={18} style={{ color: '#10b981' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--slate-800)', margin: '0' }}>Dashboard</h2>
        </div>
        <nav className={styles.sidebarNav}>
          {[
            ['/', <Home size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Home'],
            ['/prescriptions', <Folder size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Vault'],
            ['/orders', <ShoppingBag size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Orders'],
            ['/profile', <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Profile'],
            ['/settings', <Settings size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Settings']
          ].map(([href, icon, label]) => (
            <Link key={href} to={href} className={`${styles.navItem} ${pathname === href ? styles.navActive : ''}`}>
              <span className={styles.navIcon}>{icon}</span>{label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerShieldIcon}>
              <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
            </span>
            <h2>User Profile</h2>
          </div>
        </header>

        <div className={styles.content} ref={contentRef}>
          <div className={styles.pageHeader} data-reveal="true" data-delay="0">
            <div>
              <h1 className={styles.pageTitle}>Account Details</h1>
              <p className={styles.pageSubtitle}>Manage your personal information, address, and health records</p>
            </div>
          </div>

          {loading ? (
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: '1rem', margin: 0 }}>Loading your authenticated profile details...</p>
            </div>
          ) : (
            <div data-reveal="true" data-delay="80" style={{ backgroundColor: 'white', border: '1px solid var(--slate-100)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              
              {/* Profile Header Banner */}
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: 'bold' }}>
                  {(profile?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 0.25rem 0', color: 'var(--slate-900)', fontSize: '1.6rem', fontWeight: 700 }}>
                    {profile?.name || 'Logged-in User'}
                  </h2>
                  <p style={{ margin: '0 0 0.2rem 0', color: '#0ea5e9', fontSize: '0.875rem', fontWeight: 600 }}>
                    Patient ID: {patientId}
                  </p>
                  <p style={{ margin: '0', color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                    Member since {memberSince}
                  </p>
                </div>
                <button onClick={openEditModal} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.25rem' }}>
                  <Pencil size={16} /> Edit Profile
                </button>
              </div>

              {/* Grid Information Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                
                {/* Contact Info */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--slate-800)', fontSize: '1.05rem', fontWeight: 600 }}>
                    📞 Contact Information
                  </h3>
                  <p style={{ marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <strong>Email:</strong> <span style={{ color: '#334155' }}>{profile?.email || 'N/A'}</span>
                  </p>
                  <p style={{ marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <strong>Primary Phone:</strong> <span style={{ color: '#334155' }}>{profile?.phone || 'Not provided'}</span>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>Alternate Phone:</strong> <span style={{ color: profile?.altPhone ? '#334155' : '#94a3b8' }}>{profile?.altPhone || 'Not specified'}</span>
                  </p>
                </div>

                {/* Delivery Address */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--slate-800)', fontSize: '1.05rem', fontWeight: 600 }}>
                    📍 Primary Delivery Address
                  </h3>
                  {profile?.street || profile?.city ? (
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: '#334155' }}>
                      {profile.street}<br />
                      {profile.city}{profile.state ? `, ${profile.state}` : ''} {profile.zipCode ? `– ${profile.zipCode}` : ''}
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', italic: 'true' }}>
                      No delivery address added yet. Click "Edit Profile" to set your address.
                    </p>
                  )}
                </div>

                {/* Health & Medical Info */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--slate-800)', fontSize: '1.05rem', fontWeight: 600 }}>
                    🩺 Health & Medical Record
                  </h3>
                  <p style={{ marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <strong>Blood Group:</strong> <span style={{ color: '#0ea5e9', fontWeight: 600 }}>{profile?.bloodGroup || 'Not specified'}</span>
                  </p>
                  <p style={{ marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <strong>Known Allergies:</strong> <span style={{ color: profile?.allergies ? '#ef4444' : '#334155' }}>{profile?.allergies || 'None reported'}</span>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>Primary Doctor:</strong> <span style={{ color: profile?.primaryDoctor ? '#334155' : '#94a3b8' }}>{profile?.primaryDoctor || 'Not specified'}</span>
                  </p>
                </div>

                {/* Subscription & Payment */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--slate-800)', fontSize: '1.05rem', fontWeight: 600 }}>
                    💳 Subscription & Billing
                  </h3>
                  <p style={{ marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <strong>Current Plan:</strong>{' '}
                    <span style={{ color: profile?.isSubscribed ? '#10b981' : '#64748b', fontWeight: 600 }}>
                      {profile?.isSubscribed ? `MediFly Plus (${profile.subscriptionPlan || 'Active'})` : 'Free Tier'}
                    </span>
                  </p>
                  <p style={{ marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <strong>UPI ID / Payment:</strong>{' '}
                    <span style={{ color: profile?.upiId ? '#334155' : '#94a3b8' }}>
                      {profile?.upiId ? `UPI · ${profile.upiId}` : 'Not linked'}
                    </span>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    <Link to="/subscription" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>
                      Manage Auto-Refill Subscription →
                    </Link>
                  </p>
                </div>

              </div>

            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Edit Account Details</h3>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Primary Phone</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Alternate Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 22 4901 8800"
                    value={editForm.altPhone}
                    onChange={e => setEditForm({ ...editForm, altPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Blood Group</label>
                  <select
                    value={editForm.bloodGroup}
                    onChange={e => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Known Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa drugs"
                    value={editForm.allergies}
                    onChange={e => setEditForm({ ...editForm, allergies: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Primary Doctor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sunita Rao (Apollo)"
                    value={editForm.primaryDoctor}
                    onChange={e => setEditForm({ ...editForm, primaryDoctor: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <h4 style={{ margin: '1.2rem 0 0.6rem 0', color: '#0f172a', fontSize: '0.95rem' }}>Delivery Address</h4>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Street / Apartment / Flat No."
                  value={editForm.street}
                  onChange={e => setEditForm({ ...editForm, street: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.6rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                  <input
                    type="text"
                    placeholder="City"
                    value={editForm.city}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={editForm.state}
                    onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={editForm.zipCode}
                    onChange={e => setEditForm({ ...editForm, zipCode: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>UPI ID for Refund & Payment</label>
                <input
                  type="text"
                  placeholder="e.g. username@okaxis"
                  value={editForm.upiId}
                  onChange={e => setEditForm({ ...editForm, upiId: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ padding: '0.6rem 1.25rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                  {saving ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
