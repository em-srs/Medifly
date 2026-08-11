import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import styles from './LoginPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Shield, Lock, TestTubes, RefreshCw, User, CheckCircle2, Zap, Bike, Lightbulb, Hospital, Mail, Key, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [tab, setTab] = useState('email'); // 'email', 'phone', 'demo'
  const [isRegister, setIsRegister] = useState(false);
  
  // Email Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Phone Form State
  const [step, setStep] = useState('phone'); // phone, otp, role
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [role, setRole] = useState('user');

  const { loginWithEmail, registerWithEmail, demoLogin } = useAuth();
  const navigate = useNavigate();
  const pageRef = useScrollReveal(0.05);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        const u = await registerWithEmail({ name, email, password, phone: phone || '9876543210' });
        navigateByRole(u.role);
      } else {
        const u = await loginWithEmail(email, password);
        navigateByRole(u.role);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = (targetRole) => {
    const u = demoLogin(targetRole);
    navigateByRole(u.role);
  };

  const navigateByRole = (userRole) => {
    if (userRole === 'admin') navigate('/admin');
    else if (userRole === 'pharmacy') navigate('/pharmacy');
    else if (userRole === 'rider') navigate('/rider');
    else navigate('/dashboard');
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.length >= 10) setStep('otp');
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
    if (newOtp.every(d => d !== '')) {
      setStep('role');
    }
  };

  const handlePhoneLogin = () => {
    demoLogin(role, phone);
    navigateByRole(role);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container} ref={pageRef}>
        <div className={styles.left} data-reveal="left" data-delay="0">
          <div className={styles.branding}>
            <span className={styles.brandIcon}>⚕️</span>
            <h1>Welcome to <span className="text-gradient">MediFly</span></h1>
            <p>Enterprise Emergency Medicine & Refill Platform. Sign in to access your role-based portal.</p>
          </div>
          <div className={styles.features}>
            <div className={styles.feature}><span><Zap size={18} /></span> 1–6 hour emergency delivery</div>
            <div className={styles.feature}><span><TestTubes size={18} /></span> Bioequivalent salt matching engine</div>
            <div className={styles.feature}><span><RefreshCw size={18} /></span> Auto-refill for chronic meds</div>
            <div className={styles.feature}><span><Lock size={18} /></span> Secure Rx verification vault</div>
          </div>
        </div>

        <div className={styles.right} data-reveal="right" data-delay="100">
          <div className={styles.card}>
            
            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--bg-subtle, #f1f5f9)', padding: '4px', borderRadius: '12px' }}>
              <button 
                type="button" 
                onClick={() => setTab('email')} 
                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, background: tab === 'email' ? '#ffffff' : 'transparent', boxShadow: tab === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                Email Login
              </button>
              <button 
                type="button" 
                onClick={() => setTab('demo')} 
                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-primary, #0ea5e9)', background: tab === 'demo' ? '#ffffff' : 'transparent', boxShadow: tab === 'demo' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                ⚡ Demo Roles
              </button>
              <button 
                type="button" 
                onClick={() => setTab('phone')} 
                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, background: tab === 'phone' ? '#ffffff' : 'transparent', boxShadow: tab === 'phone' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                Phone OTP
              </button>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: EMAIL & PASSWORD (REAL BACKEND JWT AUTH) */}
            {tab === 'email' && (
              <form onSubmit={handleEmailSubmit} className={styles.form}>
                <h2>{isRegister ? 'Create Account' : 'Account Sign In'}</h2>
                <p className={styles.formDesc}>
                  {isRegister ? 'Register your account to access Medifly' : 'Sign in with your email and password'}
                </p>

                {isRegister && (
                  <div className={styles.inputGroup} style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required={isRegister}
                        className={styles.input}
                        style={{ paddingLeft: '36px', width: '100%' }}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.inputGroup} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                    <input
                      type="email"
                      placeholder="user@medifly.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className={styles.input}
                      style={{ paddingLeft: '36px', width: '100%' }}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className={styles.input}
                      style={{ paddingLeft: '36px', width: '100%' }}
                    />
                  </div>
                </div>

                {isRegister && (
                  <div className={styles.inputGroup} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Authenticating...' : isRegister ? 'Register Account →' : 'Sign In →'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.9rem' }}>
                  {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                  <button 
                    type="button" 
                    onClick={() => { setIsRegister(!isRegister); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary, #0ea5e9)', fontWeight: 600, cursor: 'pointer' }}>
                    {isRegister ? 'Sign In' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: DEMO ROLE PRESETS (INSTANT 1-CLICK ACCESS FOR INTERVIEWS/DEMOS) */}
            {tab === 'demo' && (
              <div className={styles.form}>
                <h2><Sparkles size={20} style={{ color: '#0ea5e9', display: 'inline', marginRight: '6px' }} /> Quick Demo Presets</h2>
                <p className={styles.formDesc}>Select any role to test platform permissions instantly</p>

                <div className={styles.roles}>
                  {[
                    { id: 'user', label: 'Patient / User', icon: <User size={18} />, desc: 'Order meds, compare salts, track deliveries', badge: 'Patient' },
                    { id: 'pharmacy', label: 'Pharmacy Partner', icon: <Hospital size={18} />, desc: 'Verify prescriptions & manage stock', badge: 'Partner' },
                    { id: 'rider', label: 'Fleet Delivery Rider', icon: <Bike size={18} />, desc: 'Accept orders & stream live location', badge: 'Logistics' },
                    { id: 'admin', label: 'Platform Admin', icon: <Shield size={18} />, desc: 'Manage system metrics & global stats', badge: 'Executive' },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      className={styles.roleCard}
                      onClick={() => handleDemoClick(r.id)}
                      style={{ textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className={styles.roleIcon}>{r.icon}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px' }}>{r.badge}</span>
                      </div>
                      <strong style={{ display: 'block', marginTop: '6px' }}>{r.label}</strong>
                      <small style={{ color: '#64748b' }}>{r.desc}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PHONE / OTP SIMULATION */}
            {tab === 'phone' && (
              <>
                {step === 'phone' && (
                  <form onSubmit={handlePhoneSubmit} className={styles.form}>
                    <h2>Phone Login</h2>
                    <p className={styles.formDesc}>Enter your 10-digit mobile number</p>
                    <div className={styles.phoneInput}>
                      <span className={styles.prefix}>+91</span>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={styles.input}
                        autoFocus
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{width: '100%'}} disabled={phone.length < 10}>
                      Send OTP →
                    </button>
                  </form>
                )}

                {step === 'otp' && (
                  <div className={styles.form}>
                    <h2>Verify OTP</h2>
                    <p className={styles.formDesc}>
                      We&apos;ve sent a 6-digit code to <strong>+91 {phone}</strong>
                    </p>
                    <div className={styles.otpContainer}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          className={styles.otpInput}
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>
                    <p className={styles.demoHint}><Lightbulb size={16} /> Enter any 6 digits to verify</p>
                  </div>
                )}

                {step === 'role' && (
                  <div className={styles.form}>
                    <h2><CheckCircle2 size={20} style={{ color: '#10b981', display: 'inline', marginRight: '6px' }} /> Verified!</h2>
                    <p className={styles.formDesc}>Select your role to continue</p>
                    <div className={styles.roles}>
                      {[
                        { id: 'user', label: 'Patient / User', icon: <User size={18} />, desc: 'Order medicines & track orders' },
                        { id: 'pharmacy', label: 'Pharmacy Partner', icon: <Hospital size={18} />, desc: 'Manage orders & verify Rx' },
                        { id: 'rider', label: 'Delivery Rider', icon: <Bike size={18} />, desc: 'Deliver medicine packages' },
                        { id: 'admin', label: 'Administrator', icon: <Shield size={18} />, desc: 'Manage platform stats' },
                      ].map(r => (
                        <button
                          key={r.id}
                          className={`${styles.roleCard} ${role === r.id ? styles.roleActive : ''}`}
                          onClick={() => setRole(r.id)}
                        >
                          <span className={styles.roleIcon}>{r.icon}</span>
                          <strong>{r.label}</strong>
                          <small>{r.desc}</small>
                        </button>
                      ))}
                    </div>
                    <button className="btn btn-primary btn-lg" style={{width: '100%'}} onClick={handlePhoneLogin}>
                      Continue as {role.charAt(0).toUpperCase() + role.slice(1)} →
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
