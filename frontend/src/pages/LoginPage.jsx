import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, SignUp, useUser } from '@clerk/react';
import { useAuth } from '@/context/AuthContext';
import styles from './LoginPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Shield, Lock, TestTubes, RefreshCw, User, Zap, Bike, Hospital, Sparkles, HeartPulse, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [selectedRole, setSelectedRole] = useState('user'); // 'user', 'pharmacy', 'rider', 'admin'
  const { user, switchRole, demoLogin } = useAuth();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const pageRef = useScrollReveal(0.05);

  // Auto-redirect signed-in users to their role portal
  useEffect(() => {
    if (user && (isSignedIn || user.id)) {
      const targetRole = user.role || selectedRole || 'user';
      if (targetRole === 'admin') navigate('/admin', { replace: true });
      else if (targetRole === 'pharmacy') navigate('/pharmacy', { replace: true });
      else if (targetRole === 'rider') navigate('/rider', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, isSignedIn, navigate, selectedRole]);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    switchRole(roleKey);
  };

  const handleDemoClick = (roleKey) => {
    const u = demoLogin(roleKey);
    if (roleKey === 'admin') navigate('/admin');
    else if (roleKey === 'pharmacy') navigate('/pharmacy');
    else if (roleKey === 'rider') navigate('/rider');
    else navigate('/dashboard');
  };

  const ROLES = [
    { id: 'user', label: 'Patient User', icon: <User size={16} />, badge: 'Patient' },
    { id: 'pharmacy', label: 'Pharmacy Partner', icon: <Hospital size={16} />, badge: 'Partner' },
    { id: 'rider', label: 'Fleet Rider', icon: <Bike size={16} />, badge: 'Logistics' },
    { id: 'admin', label: 'Platform Admin', icon: <Shield size={16} />, badge: 'Executive' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container} ref={pageRef}>
        
        {/* Left Branding Section */}
        <div className={styles.left} data-reveal="left" data-delay="0">
          <div className={styles.branding}>
            <span className={styles.brandIcon}><HeartPulse size={28} /></span>
            <h1>Welcome to <span className="text-gradient">MediFly</span></h1>
            <p>Medicines delivered in 30 minutes. Single sign-on authenticated via Clerk for all platform portals.</p>
          </div>
          <div className={styles.features}>
            <div className={styles.feature}><span><Zap size={18} /></span> Multi-tenant role authentication</div>
            <div className={styles.feature}><span><TestTubes size={18} /></span> Bioequivalent salt matching engine</div>
            <div className={styles.feature}><span><RefreshCw size={18} /></span> Auto-refill for chronic meds</div>
            <div className={styles.feature}><span><Lock size={18} /></span> Secure Rx verification vault</div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className={styles.right} data-reveal="right" data-delay="100">
          <div className={styles.card} style={{ maxWidth: '460px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Target Role Selector Bar */}
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '8px', textAlign: 'center' }}>
                Select Portal Access Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: selectedRole === r.id ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                      background: selectedRole === r.id ? '#f0f9ff' : '#ffffff',
                      color: selectedRole === r.id ? '#0284c7' : '#475569',
                      fontWeight: selectedRole === r.id ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {r.icon}
                    <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
                    {selectedRole === r.id && <CheckCircle2 size={14} style={{ color: '#0ea5e9' }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Clerk Authentication Embed */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {authMode === 'signin' ? (
                <SignIn routing="hash" appearance={{ elements: { rootBox: { width: '100%' }, card: { boxShadow: 'none', padding: 0 } } }} />
              ) : (
                <SignUp routing="hash" appearance={{ elements: { rootBox: { width: '100%' }, card: { boxShadow: 'none', padding: 0 } } }} />
              )}
            </div>

            {/* Sign In / Sign Up Mode Toggle */}
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
              {authMode === 'signin' ? (
                <span>Need a new account? <button type="button" onClick={() => setAuthMode('signup')} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontWeight: 700, cursor: 'pointer' }}>Sign Up with Clerk</button></span>
              ) : (
                <span>Already registered? <button type="button" onClick={() => setAuthMode('signin')} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontWeight: 700, cursor: 'pointer' }}>Sign In with Clerk</button></span>
              )}
            </div>

            {/* Quick Demo Preset Access */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', width: '100%', textAlign: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                <Sparkles size={14} style={{ color: '#0ea5e9' }} /> Quick Instant Demo Access
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleDemoClick(r.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    Demo {r.badge}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
