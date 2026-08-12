import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { Hospital, ShieldCheck, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

export default function PartnerApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    pharmacyName: '',
    licenseNumber: '',
    gstin: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
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
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <Hospital size={24} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Partner Pharmacy Application</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Join MediFly&apos;s licensed pharmacy network for 30-minute express medicine fulfillment</p>
          </div>

          {submitted ? (
            <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <CheckCircle2 size={42} style={{ color: '#16a34a', marginBottom: '12px' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534', margin: '0 0 8px 0' }}>Application Received (Status: PENDING)</h2>
              <p style={{ color: '#15803d', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Thank you for applying, <strong>{formData.pharmacyName || 'Partner'}</strong>! Our compliance team will review your Drug License (<code>{formData.licenseNumber || 'Submitted'}</code>) and GSTIN within 24–48 hours.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#166534', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #dcfce7', marginBottom: '20px' }}>
                <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Pharmacy partner accounts require Administrator verification before portal access is enabled.
              </div>
              <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Return to Homepage</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Pharmacy Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Meds Pvt Ltd"
                    value={formData.pharmacyName}
                    onChange={e => setFormData({ ...formData, pharmacyName: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Drug License Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-2024-MH-998811"
                    value={formData.licenseNumber}
                    onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>GSTIN Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="27AAAAA0000A1Z5"
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Owner / Registered Pharmacist *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Rajesh Kumar"
                    value={formData.ownerName}
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@pharmacy.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={styles.input}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Phone Number *</label>
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Pharmacy Store Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Street Address, Area, Pincode"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className={styles.input}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={18} /> Submit Partner Application
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
