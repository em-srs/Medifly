import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import styles from './Footer.module.css';
import { Globe } from 'lucide-react';

export default function Footer() {
  const pathname = useLocation().pathname;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIconBg}>
                <span className={styles.logoIcon}>+</span>
              </div>
              <span className={styles.logoText}>MediFly</span>
            </div>
            <p className={styles.tagline}>
              Medicines delivered in 30 minutes. Licensed, verified, and professional healthcare delivery across India.
            </p>
            <div className={styles.social}>
              <a href="#" aria-label="X (Twitter)" className={styles.socialIcon}>𝕏</a>
              <a href="#" aria-label="Instagram" className={styles.socialIcon}>📷</a>
              <a href="#" aria-label="Website" className={styles.socialIcon}><Globe size={16} /></a>
            </div>
          </div>

          <div className={styles.linksBlock}>
            <div className={styles.links}>
              <h4>Company</h4>
              <Link to="/about">About MediFly</Link>
              <Link to="/partner/apply">Partner Application</Link>
              <Link to="/rider/apply">Fleet Rider Application</Link>
            </div>

            <div className={styles.links}>
              <h4>Services</h4>
              <Link to="/medicines">OTC & Prescription Meds</Link>
              <Link to="/prescriptions">Prescription Vault</Link>
              <Link to="/salt-compare">Salt Comparison</Link>
              <Link to="/subscription">Auto-Refill Schedule</Link>
            </div>

            <div className={styles.links}>
              <h4>Support & Contact</h4>
              <Link to="/about#contact">Contact & Help Center</Link>
              <Link to="/about">About Us & Mission</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} MediFly Healthcare Technologies Inc. All rights reserved.</p>
          <p>Pharmacy License: #MD-FLY-2024-XX</p>
        </div>
      </div>
    </footer>
  );
}
