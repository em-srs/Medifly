import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { Bike, CheckCircle2, ArrowLeft, Send, ShieldCheck } from 'lucide-react';

export default function RiderApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    drivingLicense: '',
    vehicleType: 'EV Two-Wheeler',
    phone: '',
    email: '',
    operatingZone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0ea5e9', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <div className={styles.card} style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <Bike size={24} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Fleet Rider Registration</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Join MediFly&apos;s 30-minute ultra-express emergency delivery fleet</p>
          </div>

          {submitted ? (
            <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <CheckCircle2 size={42} style={{ color: '#16a34a', marginBottom: '12px' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534', margin: '0 0 8px 0' }}>Registration Submitted (Status: PENDING)</h2>
              <p style={{ color: '#15803d', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Thank you for applying, <strong>{formData.fullName || 'Rider'}</strong>! Our dispatch operations team will verify your Driving License (<code>{formData.drivingLicense || 'Submitted'}</code>) and zone availability.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#166534', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #dcfce7', marginBottom: '20px' }}>
                <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Rider accounts remain inactive until background verification is approved by MediFly Operations.
              </div>
              <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Return to Homepage</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Driving License Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-0420110099887"
                    value={formData.drivingLicense}
                    onChange={e => setFormData({ ...formData, drivingLicense: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Vehicle Category *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  >
                    <option value="EV Two-Wheeler">EV Scooter / Bike</option>
                    <option value="Petrol Motorcycle">Petrol Motorcycle</option>
                    <option value="Bicycle">Bicycle (Ultra Local)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Operating Zone / Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central City Sector 4"
                    value={formData.operatingZone}
                    onChange={e => setFormData({ ...formData, operatingZone: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rider@medifly.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={18} /> Submit Fleet Registration
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
