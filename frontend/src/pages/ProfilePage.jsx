import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import styles from './PrescriptionsPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { User, Briefcase, Home, ShoppingBag, Folder, Settings } from 'lucide-react';


export default function ProfilePage() {
  const pathname = useLocation().pathname;
  const contentRef = useScrollReveal(0.05);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--slate-800)', margin: '0' }}>Dashboard</h2>
        </div>
        <nav className={styles.sidebarNav}>
          {[['/', <Home size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Home'], ['/prescriptions', <Folder size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Vault'], ['/orders', <ShoppingBag size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Orders'], ['/profile', <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Profile'], ['/settings', <Settings size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Settings']].map(([href, icon, label]) => (
            <Link key={href} to={href} className={`${styles.navItem} ${pathname === href ? styles.navActive : ''}`}>
              <span className={styles.navIcon}>{icon}</span>{label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerShieldIcon}><User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            <h2>User Profile</h2>
          </div>
        </header>

        <div className={styles.content} ref={contentRef}>
          <div className={styles.pageHeader} data-reveal="true" data-delay="0">
            <div>
              <h1 className={styles.pageTitle}>Account Details</h1>
              <p className={styles.pageSubtitle}>Manage your personal information and preferences</p>
            </div>
          </div>

          <div data-reveal="true" data-delay="80" style={{ backgroundColor: 'white', border: '1px solid var(--slate-100)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal-400), var(--teal-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />‍<Briefcase size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
              </div>
              <div>
                <h2 style={{ margin: '0 0 0.25rem 0', color: 'var(--slate-900)', fontSize: '1.5rem' }}>Arjun Mehta</h2>
                <p style={{ margin: '0 0 0.15rem 0', color: 'var(--slate-500)', fontSize: '0.875rem' }}>Patient ID: MF-98234-A</p>
                <p style={{ margin: '0', color: 'var(--slate-500)', fontSize: '0.875rem' }}>Member since January 2026</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--slate-800)' }}>Contact Info</h3>
                <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> arjun.mehta@gmail.com</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Phone:</strong> +91 98201 34567</p>
                <p><strong>Alt Phone:</strong> +91 22 4901 8800</p>
              </div>
              <div>
                <h3 style={{ borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--slate-800)' }}>Delivery Address</h3>
                <p>Flat 402, Shivam Heights<br />Andheri West<br />Mumbai, Maharashtra – 400 053</p>
              </div>
              <div>
                <h3 style={{ borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--slate-800)' }}>Health Info</h3>
                <p style={{ marginBottom: '0.5rem' }}><strong>Blood Group:</strong> B+</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Known Allergies:</strong> Penicillin</p>
                <p><strong>Primary Doctor:</strong> Dr. Sunita Rao, Apollo Mumbai</p>
              </div>
              <div>
                <h3 style={{ borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--slate-800)' }}>Subscription</h3>
                <p style={{ marginBottom: '0.5rem' }}><strong>Plan:</strong> MediFly Plus (Monthly)</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Next Refill:</strong> 12 Nov 2024</p>
                <p><strong>Payment:</strong> UPI · arjunmehta@okaxis</p>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Edit Profile</button>
              <button className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>Reset Password</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
