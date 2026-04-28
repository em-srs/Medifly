import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import styles from './PrescriptionsPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Map, Home, ShoppingBag, Folder, ShoppingCart, User, Settings, Snowflake, MapPin } from 'lucide-react';


const ORDERS = [
  {
    id: 'MF-2026-9341',
    date: '14 Jan 2026',
    total: '₹340',
    status: 'DELIVERED',
    statusColor: { bg: 'var(--teal-50)', text: 'var(--teal-700)' },
    items: '1× Atorvastatin 20mg (Lipvas) · 2× Metformin 500mg ER (Glycomet SR)',
    address: 'Delivered to Andheri West, Mumbai',
    rider: null,
  },
  {
    id: 'MF-2026-9378',
    date: '28 Jan 2026',
    total: '₹2,100',
    status: 'OUT FOR DELIVERY',
    statusColor: { bg: '#FEF3C7', text: '#B45309' },
    items: <>1× Insulin Glargine 100 IU/ml (Lantus) — <Snowflake size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Cold Chain</>,
    address: 'Delivering to Goregaon East, Mumbai',
    rider: 'Rider: Vikram Chavan · ETA 22 mins',
  },
  {
    id: 'MF-2025-9290',
    date: '02 Dec 2025',
    total: '₹189',
    status: 'DELIVERED',
    statusColor: { bg: 'var(--teal-50)', text: 'var(--teal-700)' },
    items: '1× Telma 40 (Telmisartan) · 1× Ecosprin 75mg',
    address: 'Delivered to Bandra West, Mumbai',
    rider: null,
  },
];

export default function OrdersPage() {
  const pathname = useLocation().pathname;
  const headerRef  = useScrollReveal(0.05);
  const contentRef = useScrollReveal(0.08);

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
            <span className={styles.headerShieldIcon}><ShoppingBag size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            <h2>Order History</h2>
          </div>
        </header>

        <div className={styles.content} ref={contentRef}>
          <div className={styles.pageHeader} data-reveal="true" data-delay="0">
            <div>
              <h1 className={styles.pageTitle}>Your Orders</h1>
              <p className={styles.pageSubtitle}>Track and manage your deliveries across India</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ORDERS.map((order, i) => (
              <div key={i} data-reveal="true" data-delay={i * 80} style={{ backgroundColor: 'white', border: '1px solid var(--slate-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.2rem 0', color: 'var(--slate-900)', fontSize: '1rem' }}>Order #{order.id}</h3>
                    <p style={{ margin: '0', color: 'var(--slate-500)', fontSize: '0.82rem' }}>
                      Placed on: {order.date} &nbsp;·&nbsp; Total: <strong style={{ color: 'var(--slate-800)' }}>{order.total}</strong>
                    </p>
                  </div>
                  <span style={{ backgroundColor: order.statusColor.bg, color: order.statusColor.text, padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {order.status}
                  </span>
                </div>

                <p style={{ margin: '0 0 0.35rem 0', color: 'var(--slate-700)', fontSize: '0.88rem' }}>
                  <ShoppingCart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {order.items}
                </p>
                <p style={{ margin: '0 0 0.35rem 0', color: 'var(--slate-500)', fontSize: '0.82rem' }}>
                  <MapPin size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {order.address}
                </p>
                {order.rider && (
                  <p style={{ margin: '0 0 1rem 0', color: 'var(--teal-700)', fontSize: '0.82rem', fontWeight: '600' }}>
                    🛵 {order.rider}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  {order.status === 'OUT FOR DELIVERY' && (
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}><Map size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Track Live</button>
                  )}
                  <button className="btn btn-outline" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>View Receipt</button>
                  {order.status === 'DELIVERED' && (
                    <button className="btn btn-outline" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>🔁 Reorder</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
