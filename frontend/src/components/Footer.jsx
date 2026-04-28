import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import styles from './Footer.module.css';
import { Globe } from 'lucide-react';

export default function Footer() {
  const pathname = useLocation().pathname;
  
  // The footer should be visible globally

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
              The fastest, safest way to get your medications. Licensed, verified, and professional healthcare delivery.
            </p>
            <div className={styles.social}>
              <a href="#" aria-label="X (Twitter)" className={styles.socialIcon}>𝕏</a>
              <a href="#" aria-label="Instagram" className={styles.socialIcon}>📷</a>
              <a href="#" aria-label="Website" className={styles.socialIcon}><Globe size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></a>
            </div>
          </div>

          <div className={styles.linksBlock}>
            <div className={styles.links}>
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="#">Our Pharmacies</Link>
              <Link to="#">Careers</Link>
              <Link to="#">Press</Link>
            </div>

            <div className={styles.links}>
              <h4>Services</h4>
              <Link to="/prescriptions">Prescription Delivery</Link>
              <Link to="/medicines">OTC Medicines</Link>
              <Link to="#">Diagnostics</Link>
              <Link to="#">Lab Tests</Link>
            </div>

            <div className={styles.links}>
              <h4>Support</h4>
              <Link to="#">Help Center</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="#">Privacy Policy</Link>
              <Link to="#">Terms of Service</Link>
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
