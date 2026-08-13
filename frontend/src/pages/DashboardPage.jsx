import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import styles from './DashboardPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Lock, TestTubes, RefreshCw, Package, CheckCircle2, Pill, Search, Bike, Clock, FileText, ShoppingBag } from 'lucide-react';

export default function DashboardPage() {
  const { user, apiCall } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [userStats, setUserStats] = useState({ totalOrders: 0, totalSpent: 0, totalPrescriptions: 0 });
  const [loadingOrders, setLoadingOrders] = useState(true);
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

  // Fetch real authenticated user orders & stats from backend
  useEffect(() => {
    let isMounted = true;
    if (user) {
      setLoadingOrders(true);

      // 1. Fetch authenticated orders
      apiCall('/api/orders/myorders')
        .then(data => {
          if (isMounted && Array.isArray(data)) {
            setRecentOrders(data.slice(0, 5));
          }
        })
        .catch(err => console.warn('Could not fetch recent orders:', err.message))
        .finally(() => {
          if (isMounted) setLoadingOrders(false);
        });

      // 2. Fetch authenticated SQL aggregate stats
      apiCall('/api/users/stats')
        .then(data => {
          if (isMounted && data) {
            setUserStats(data);
          }
        })
        .catch(err => console.warn('Could not fetch user stats:', err.message));
    }
    return () => { isMounted = false; };
  }, [user, apiCall]);

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
    const status = (s || '').toLowerCase();
    if (status.includes('delivered')) return <CheckCircle2 size={16} />;
    if (status.includes('transit') || status.includes('dispatched')) return <Bike size={16} />;
    return <Clock size={16} />;
  };

  return (
    <div className={styles.page}>
      <div className="container" ref={pageRef}>
        <div className={styles.greeting} data-reveal="true" data-delay="0">
          <h1>Welcome back, <span className="text-gradient">{user.name || 'User'}</span></h1>
          <p>Manage your orders, prescriptions, and auto-refill subscriptions from here.</p>
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
            <span className={styles.actionIcon}><FileText size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
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
            <small>{user.isSubscribed ? 'Manage refills' : 'Set up auto-refill'}</small>
          </Link>
        </div>

        <div className={styles.grid}>
          {/* Recent Orders */}
          <div className={styles.section} ref={ordersRef}>
            <div className={styles.sectionHeader} data-reveal="true" data-delay="0">
              <h2><Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Recent Orders</h2>
              <Link to="/orders" className={styles.viewAll}>View All →</Link>
            </div>
            
            <div className={styles.orderList}>
              {loadingOrders ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading recent orders...</p>
              ) : recentOrders.length === 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem', textAlign: 'center' }}>
                  <ShoppingBag size={36} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1.1rem' }}>No recent orders</h3>
                  <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.875rem' }}>Your order history will appear here once you place an order.</p>
                  <Link to="/medicines" className="btn btn-primary btn-sm">Order Medicines Now</Link>
                </div>
              ) : (
                recentOrders.map((order, i) => (
                  <div key={order.id || i} className={styles.orderCard} data-reveal="true" data-delay={i * 80}>
                    <div className={styles.orderHeader}>
                      <span className={styles.orderId}>Order #{order.id}</span>
                      <span className={`badge ${order.status === 'delivered' ? 'badge-green' : order.status === 'in transit' ? 'badge-blue' : 'badge-yellow'}`}>
                        {statusIcon(order.status)} {order.status || 'Processing'}
                      </span>
                    </div>
                    <div className={styles.orderItems}>
                      {(order.orderItems || order.items || []).map((item, idx) => (
                        <span key={idx}>{item.name} × {item.qty}</span>
                      ))}
                    </div>
                    <div className={styles.orderFooter}>
                      <span>₹{(order.totalPrice || order.total_price || 0).toFixed(2)}</span>
                      <span>Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real User Stats */}
          <div className={styles.sidebar} ref={sideRef}>
            <div className={styles.statsCard} data-reveal="right" data-delay="0">
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.1rem' }}>Your Account Stats</h3>
              <div className={styles.statsList}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{userStats.totalOrders}</span>
                  <span className={styles.statLabel}>Total Orders</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{userStats.totalPrescriptions}</span>
                  <span className={styles.statLabel}>Prescriptions</span>
                </div>
                <div className={styles.stat} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.statValue}>₹{userStats.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span className={styles.statLabel}>Total Amount Spent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
