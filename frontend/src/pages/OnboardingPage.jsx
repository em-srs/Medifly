import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User, Phone, MapPin, Building, ArrowRight, ShieldCheck } from 'lucide-react';
import styles from './OnboardingPage.module.css';

export default function OnboardingPage() {
  const { user, setDbUser, apiCall } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.street || '',
    city: user?.city || '',
    zipCode: user?.zipCode || '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const phoneTrimmed = formData.phone.trim();
    if (!phoneTrimmed) {
      setError('Phone number is required for delivery & order updates.');
      return;
    }

    if (phoneTrimmed.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiCall('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name.trim() || user?.name,
          phone: phoneTrimmed,
          street: formData.street.trim(),
          city: formData.city.trim(),
          zipCode: formData.zipCode.trim(),
        }),
      });

      if (res.user) {
        setDbUser(res.user);
        localStorage.setItem('medifly_db_user', JSON.stringify(res.user));
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Onboarding submit error:', err);
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.onboardingCard}>
        <div className={styles.header}>
          <div className={styles.iconBadge}>
            <ShieldCheck size={28} />
          </div>
          <h1 className={styles.title}>Welcome to MediFly</h1>
          <p className={styles.subtitle}>
            Please complete your contact details for 10-minute emergency delivery & notifications.
          </p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span>Full Name</span>
              <span className={styles.optionalTag}>Optional</span>
            </label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input
                type="text"
                name="name"
                className={styles.input}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span>Phone Number</span>
              <span className={styles.requiredTag}>* Required</span>
            </label>
            <div className={styles.inputWrapper}>
              <Phone className={styles.inputIcon} size={18} />
              <input
                type="tel"
                name="phone"
                className={styles.input}
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span>Delivery Address</span>
              <span className={styles.optionalTag}>Optional (can fill at checkout)</span>
            </label>
            <div className={styles.inputWrapper}>
              <MapPin className={styles.inputIcon} size={18} />
              <input
                type="text"
                name="street"
                className={styles.input}
                value={formData.street}
                onChange={handleChange}
                placeholder="Flat / House No. / Street Address"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>City</span>
              </label>
              <div className={styles.inputWrapper}>
                <Building className={styles.inputIcon} size={18} />
                <input
                  type="text"
                  name="city"
                  className={styles.input}
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>Pincode / Zip</span>
              </label>
              <div className={styles.inputWrapper}>
                <MapPin className={styles.inputIcon} size={18} />
                <input
                  type="text"
                  name="zipCode"
                  className={styles.input}
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="e.g. 400001"
                />
              </div>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Saving Profile...' : <>Complete Setup & Continue <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
