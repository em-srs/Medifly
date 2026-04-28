import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import styles from './LoginPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Shield, Lock, TestTubes, RefreshCw, User, CheckCircle2, Zap, Bike, Lightbulb, Hospital } from 'lucide-react';


export default function LoginPage() {
  const [step, setStep] = useState('phone'); // phone, otp, role
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [role, setRole] = useState('user');
  const { login } = useAuth();
  const navigate = useNavigate();

  const pageRef = useScrollReveal(0.05);

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

  const handleLogin = () => {
    login(phone, role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'pharmacy') navigate('/pharmacy');
    else if (role === 'rider') navigate('/rider');
    else navigate('/dashboard');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container} ref={pageRef}>
        <div className={styles.left} data-reveal="left" data-delay="0">
          <div className={styles.branding}>
            <span className={styles.brandIcon}>⚕️</span>
            <h1>Welcome to <span className="text-gradient">MediFly</span></h1>
            <p>Medicines delivered in 1–6 hours. Login to access your dashboard, prescriptions, and orders.</p>
          </div>
          <div className={styles.features}>
            <div className={styles.feature}><span><Zap size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span> Quick 1–6 hour delivery</div>
            <div className={styles.feature}><span><TestTubes size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span> Salt comparison tool</div>
            <div className={styles.feature}><span><RefreshCw size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span> Auto-refill for chronic meds</div>
            <div className={styles.feature}><span><Lock size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span> Secure prescription vault</div>
          </div>
        </div>

        <div className={styles.right} data-reveal="right" data-delay="100">
          <div className={styles.card}>
            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className={styles.form}>
                <h2>Login / Sign Up</h2>
                <p className={styles.formDesc}>Enter your phone number to get started</p>
                <div className={styles.phoneInput}>
                  <span className={styles.prefix}>+91</span>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={styles.input}
                    autoFocus
                    id="phone-input"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{width: '100%'}} disabled={phone.length < 10} id="send-otp">
                  Send OTP →
                </button>
                <p className={styles.terms}>By continuing, you agree to our Terms of Service & Privacy Policy</p>
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
                <p className={styles.resend}>
                  Didn&apos;t receive? <button className={styles.resendBtn}>Resend OTP</button>
                </p>
                <p className={styles.demoHint}><Lightbulb size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Demo: Enter any 6 digits</p>
              </div>
            )}

            {step === 'role' && (
              <div className={styles.form}>
                <h2><CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Verified!</h2>
                <p className={styles.formDesc}>Select your role to continue</p>
                <div className={styles.roles}>
                  {[
                    { id: 'user', label: 'Patient / User', icon: <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, desc: 'Order medicines, manage prescriptions' },
                    { id: 'pharmacy', label: 'Pharmacy Partner', icon: <Hospital size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, desc: 'Manage orders and stock' },
                    { id: 'rider', label: 'Delivery Rider', icon: <Bike size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, desc: 'Deliver medicines' },
                    { id: 'admin', label: 'Administrator', icon: <Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, desc: 'Manage the platform' },
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
                <button className="btn btn-primary btn-lg" style={{width: '100%'}} onClick={handleLogin} id="login-btn">
                  Continue as {role.charAt(0).toUpperCase() + role.slice(1)} →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
