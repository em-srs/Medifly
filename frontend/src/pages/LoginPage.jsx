import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SignIn, SignUp, useUser } from '@clerk/react';
import { useAuth } from '@/context/AuthContext';
import styles from './LoginPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { HeartPulse, Zap, TestTubes, RefreshCw, Lock, Hospital, Bike } from 'lucide-react';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const { user } = useAuth();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const pageRef = useScrollReveal(0.05);

  // Auto-redirect authenticated users to their corresponding dashboard
  useEffect(() => {
    if (user && (isSignedIn || user.id)) {
      const targetRole = user.role || 'user';
      if (targetRole === 'admin' || targetRole === 'super_admin') navigate('/admin', { replace: true });
      else if (targetRole === 'pharmacy') navigate('/pharmacy', { replace: true });
      else if (targetRole === 'rider') navigate('/rider', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, isSignedIn, navigate]);

  // Shared Clerk Appearance Theme matching MediFly Design System
  const clerkAppearance = {
    layout: {
      socialButtonsVariant: 'iconButton',
      showOptionalFields: false,
    },
    variables: {
      colorPrimary: '#0ea5e9',
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      colorTextSecondary: '#64748b',
      colorInputBackground: '#f8fafc',
      colorInputText: '#0f172a',
      borderRadius: '0.75rem',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    elements: {
      cardBox: {
        boxShadow: 'none',
        border: 'none',
        width: '100%',
      },
      card: {
        boxShadow: 'none',
        border: 'none',
        padding: '0',
        backgroundColor: 'transparent',
        width: '100%',
      },
      headerTitle: {
        color: '#0f172a',
        fontSize: '1.2rem',
        fontWeight: '700',
      },
      headerSubtitle: {
        color: '#64748b',
        fontSize: '0.85rem',
      },
      socialButtonsBlockButton: {
        borderRadius: '0.75rem',
        borderColor: '#cbd5e1',
        color: '#334155',
        height: '42px',
        '&:hover': {
          backgroundColor: '#f1f5f9',
        },
      },
      formButtonPrimary: {
        backgroundColor: '#0ea5e9',
        fontSize: '0.9rem',
        fontWeight: '600',
        borderRadius: '0.75rem',
        padding: '0.625rem 1rem',
        height: '42px',
        '&:hover': {
          backgroundColor: '#0284c7',
        },
      },
      formFieldInput: {
        borderRadius: '0.75rem',
        borderColor: '#cbd5e1',
        height: '42px',
        fontSize: '0.9rem',
      },
      dividerLine: {
        backgroundColor: '#e2e8f0',
      },
      dividerText: {
        color: '#94a3b8',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
      },
      footer: {
        display: 'none', // Remove "Secured by Clerk" & "Development mode"
      },
      footerAction: {
        display: 'none', // Remove duplicate sign up footer prompt
      },
      devModeBadge: {
        display: 'none', // Hide dev mode badge
      },
    },
  };

  return (
    <div className={styles.page}>
      <div className={styles.container} ref={pageRef}>
        
        {/* Left Marketing Hero Copy */}
        <div className={styles.left} data-reveal="left" data-delay="0">
          <div className={styles.branding}>
            <span className={styles.brandIcon}><HeartPulse size={28} /></span>
            <h1>Welcome to <span className="text-gradient">MediFly</span></h1>
            <p>Medicines delivered in 30 minutes. One secure account across MediFly to order medicines, manage prescriptions, and track express deliveries.</p>
          </div>
          <div className={styles.features}>
            <div className={styles.feature}><span><Zap size={18} /></span> 30-minute emergency delivery</div>
            <div className={styles.feature}><span><TestTubes size={18} /></span> Bioequivalent salt matching engine</div>
            <div className={styles.feature}><span><RefreshCw size={18} /></span> Auto-refill for chronic meds</div>
            <div className={styles.feature}><span><Lock size={18} /></span> Secure Rx verification vault</div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className={styles.right} data-reveal="right" data-delay="100">
          <div className={styles.card} style={{ maxWidth: '420px', width: '100%', margin: '0 auto', padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Embedded Clerk Sign In / Sign Up Widget */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {authMode === 'signin' ? (
                <SignIn routing="hash" appearance={clerkAppearance} />
              ) : (
                <SignUp routing="hash" appearance={clerkAppearance} />
              )}
            </div>

            {/* Clean Auth Mode Toggle */}
            <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
              {authMode === 'signin' ? (
                <span>New to MediFly? <button type="button" onClick={() => setAuthMode('signup')} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Create a Patient Account</button></span>
              ) : (
                <span>Already have an account? <button type="button" onClick={() => setAuthMode('signin')} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Sign In</button></span>
              )}
            </div>

            {/* Low-Emphasis Partner Application Link */}
            <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Hospital size={14} style={{ color: '#4f46e5' }} /> Own a pharmacy?{' '}
                <Link to="/partner/apply" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                  Apply to partner with MediFly →
                </Link>
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Bike size={14} style={{ color: '#d97706' }} /> Want to join our fleet?{' '}
                <Link to="/rider/apply" style={{ color: '#d97706', fontWeight: 600, textDecoration: 'none' }}>
                  Apply as a Fleet Rider →
                </Link>
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
