import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import styles from './PrescriptionsPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Home, ShoppingBag, Folder, User, Settings } from 'lucide-react';


export default function SettingsPage() {
  const pathname = useLocation().pathname;
  const contentRef = useScrollReveal(0.05);

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
           <h2 style={{ fontSize: '1.2rem', color: 'var(--slate-800)', margin: '0' }}>Dashboard</h2>
        </div>
        
        <nav className={styles.sidebarNav}>
          <Link to="/" className={`${styles.navItem} ${pathname === '/' ? styles.navActive : ''}`}>
            <span className={styles.navIcon}><Home size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            Home
          </Link>
          <Link to="/prescriptions" className={`${styles.navItem} ${pathname === '/prescriptions' ? styles.navActive : ''}`}>
            <span className={styles.navIcon}><Folder size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            Vault
          </Link>
          <Link to="/orders" className={`${styles.navItem} ${pathname === '/orders' ? styles.navActive : ''}`}>
            <span className={styles.navIcon}><ShoppingBag size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            Orders
          </Link>
          <Link to="/profile" className={`${styles.navItem} ${pathname === '/profile' ? styles.navActive : ''}`}>
            <span className={styles.navIcon}><User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            Profile
          </Link>
          <Link to="/settings" className={`${styles.navItem} ${pathname === '/settings' ? styles.navActive : ''}`}>
            <span className={styles.navIcon}><Settings size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerShieldIcon}><Settings size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            <h2>Settings</h2>
          </div>
        </header>

        {/* Content Area */}
        <div className={styles.content} ref={contentRef}>
          <div className={styles.pageHeader} data-reveal="true" data-delay="0">
            <div>
              <h1 className={styles.pageTitle}>Account Settings</h1>
              <p className={styles.pageSubtitle}>Update your app preferences and notifications</p>
            </div>
          </div>

          <div data-reveal="true" data-delay="80" style={{ backgroundColor: 'white', border: '1px solid var(--slate-100)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
             
             <div style={{ marginBottom: '2rem' }}>
                 <h3 style={{ margin: '0 0 1rem 0', color: 'var(--slate-800)' }}>Notifications</h3>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Email updates for orders</span>
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <input type="checkbox" defaultChecked />
                    <span>SMS alerts for deliveries</span>
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Monthly health newsletter</span>
                 </label>
             </div>

             <div style={{ marginBottom: '2rem' }}>
                 <h3 style={{ margin: '0 0 1rem 0', color: 'var(--slate-800)' }}>Security</h3>
                 <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>Setup Two-Factor Auth (2FA)</button>
             </div>

             <h3 style={{ color: '#DC2626', borderBottom: '1px solid #FEE2E2', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Danger Zone</h3>
             <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', borderColor: '#DC2626', color: '#DC2626' }}>Delete Account</button>
             
          </div>
        </div>
      </main>
    </div>
  );
}
