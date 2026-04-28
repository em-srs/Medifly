import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { sampleOrders } from '@/data/mockData';
import styles from './DashboardPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Lock, TestTubes, RefreshCw, Package, CheckCircle2, Sparkles, Pill, Search, Bike } from 'lucide-react';


export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const debounceRef = useRef(null);

  // Debounced medicine search via static JSON
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch('/medicines.json');
        const data = await res.json();
        const sq = searchQuery.toLowerCase();
        const results = data.filter(med => 
          med.name.toLowerCase().includes(sq) ||
          med.salt.toLowerCase().includes(sq)
        ).slice(0, 5);
        setSearchResults(results);
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const pageRef    = useScrollReveal(0.05);
  const actionsRef = useScrollReveal(0.1);
  const ordersRef  = useScrollReveal(0.08);
  const sideRef    = useScrollReveal(0.08);

  if (!user) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon"><Lock size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
            <h3>Please login to access your dashboard</h3>
            <Link to="/login" className="btn btn-primary" style={{marginTop: '1rem'}}>Login →</Link>
          </div>
        </div>
      </div>
    );
  }

  const statusIcon = (s) => {
    if (s === 'Delivered') return <CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />;
    if (s === 'In Transit') return <Bike size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />;
    if (s === 'Processing') return '⏳';
    return <Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />;
  };

  return (
    <div className={styles.page}>
      <div className="container" ref={pageRef}>
        <div className={styles.greeting} data-reveal="true" data-delay="0">
          <h1>Welcome back, <span className="text-gradient">{user.name || 'User'}</span> 👋</h1>
          <p>Manage your orders, prescriptions, and subscriptions from here.</p>
        </div>

        {/* Quick Search */}
        <div className={styles.searchSection} data-reveal="true" data-delay="80">
          <div className={styles.searchBar}>
            <span><Search size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            <input
              type="text"
              placeholder="Quick search medicines..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              id="dash-search"
            />
          </div>
          {searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map(m => (
                <Link to="/medicines" key={m.id} className={styles.searchResult}>
                  <span>{m.image ? <img src={m.image} alt={m.name} style={{width: 36, height: 36, borderRadius: 8, objectFit: 'cover'}} /> : <Pill size={20} />}</span>
                  <div>
                    <strong>{m.name}</strong>
                    <small>{m.salt} • ₹{m.price}</small>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions} ref={actionsRef}>
          <Link to="/medicines" className={styles.actionCard} data-reveal="scale" data-delay="0">
            <span className={styles.actionIcon}><Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            <strong>Order Medicines</strong>
            <small>Browse & order</small>
          </Link>
          <Link to="/prescriptions" className={styles.actionCard} data-reveal="scale" data-delay="80">
            <span className={styles.actionIcon}>📋</span>
            <strong>Upload Prescription</strong>
            <small>Quick upload</small>
          </Link>
          <Link to="/salt-compare" className={styles.actionCard} data-reveal="scale" data-delay="160">
            <span className={styles.actionIcon}><TestTubes size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            <strong>Salt Compare</strong>
            <small>Find alternatives</small>
          </Link>
          <Link to="/subscription" className={styles.actionCard} data-reveal="scale" data-delay="240">
            <span className={styles.actionIcon}><RefreshCw size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            <strong>Auto-Refill</strong>
            <small>{user.isSubscriber ? 'Manage refills' : 'Subscribe now'}</small>
          </Link>
        </div>

        <div className={styles.grid}>
          {/* Recent Orders */}
          <div className={styles.section} ref={ordersRef}>
            <div className={styles.sectionHeader} data-reveal="true" data-delay="0">
              <h2><Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Recent Orders</h2>
              <Link to="/medicines" className={styles.viewAll}>View All →</Link>
            </div>
            <div className={styles.orderList}>
              {sampleOrders.map((order, i) => (
                <div key={order.id} className={styles.orderCard} data-reveal="true" data-delay={i * 80}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={`badge ${order.status === 'Delivered' ? 'badge-green' : order.status === 'In Transit' ? 'badge-blue' : 'badge-yellow'}`}>
                      {statusIcon(order.status)} {order.status}
                    </span>
                  </div>
                  <div className={styles.orderItems}>
                    {order.items.map((item, i) => (
                      <span key={i}>{item.name} × {item.qty}</span>
                    ))}
                  </div>
                  <div className={styles.orderFooter}>
                    <span>₹{order.total}</span>
                    <span>{order.pharmacy}</span>
                    {order.eta && <span className={styles.eta}>ETA: {order.eta}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription & Stats */}
          <div className={styles.sidebar} ref={sideRef}>
            <div className={styles.subCard} data-reveal="right" data-delay="0">
              {user.isSubscriber ? (
                <>
                  <span className={styles.subIcon}><Sparkles size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
                  <h3>MediFly Pro Active</h3>
                  <p>Valid till {new Date(user.subscriptionExpiry).toLocaleDateString()}</p>
                  <Link to="/subscription" className="btn btn-secondary btn-sm" style={{marginTop:'var(--space-3)'}}>Manage →</Link>
                </>
              ) : (
                <>
                  <span className={styles.subIcon}><RefreshCw size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
                  <h3>Upgrade to Pro</h3>
                  <p>Save on every order with auto-refill</p>
                  <Link to="/subscription" className="btn btn-primary btn-sm" style={{marginTop:'var(--space-3)'}}>Subscribe — ₹99/mo →</Link>
                </>
              )}
            </div>

            <div className={styles.statsCard} data-reveal="right" data-delay="120">
              <h3>Your Stats</h3>
              <div className={styles.statsList}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>4</span>
                  <span className={styles.statLabel}>Total Orders</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>3</span>
                  <span className={styles.statLabel}>Prescriptions</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>₹1,408</span>
                  <span className={styles.statLabel}>Total Spent</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>47m</span>
                  <span className={styles.statLabel}>Avg Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
