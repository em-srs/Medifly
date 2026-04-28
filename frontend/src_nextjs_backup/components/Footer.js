'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();
  
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
              <a href="#" aria-label="Website" className={styles.socialIcon}>🌐</a>
            </div>
          </div>

          <div className={styles.linksBlock}>
            <div className={styles.links}>
              <h4>Company</h4>
              <Link href="/about">About Us</Link>
              <Link href="#">Our Pharmacies</Link>
              <Link href="#">Careers</Link>
              <Link href="#">Press</Link>
            </div>

            <div className={styles.links}>
              <h4>Services</h4>
              <Link href="/prescriptions">Prescription Delivery</Link>
              <Link href="/medicines">OTC Medicines</Link>
              <Link href="#">Diagnostics</Link>
              <Link href="#">Lab Tests</Link>
            </div>

            <div className={styles.links}>
              <h4>Support</h4>
              <Link href="#">Help Center</Link>
              <Link href="/contact">Contact Us</Link>
              <Link href="#">Privacy Policy</Link>
              <Link href="#">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© 2024 MediFly Healthcare Technologies Inc. All rights reserved.</p>
          <p>Pharmacy License: #MD-FLY-2024-XX</p>
        </div>
      </div>
    </footer>
  );
}
