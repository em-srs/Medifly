'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { sampleOrders } from '@/data/mockData';
import styles from './page.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const debounceRef = useRef(null);

  // Debounced medicine search via API
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/medicines?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data.items || []);
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
            <div className="empty-state-icon">🔒</div>
            <h3>Please login to access your dashboard</h3>
            <Link href="/login" className="btn btn-primary" style={{marginTop: '1rem'}}>Login →</Link>
          </div>
        </div>
      </div>
    );
  }

  const statusIcon = (s) => {
    if (s === 'Delivered') return '✅';
    if (s === 'In Transit') return '🚴';
    if (s === 'Processing') return '⏳';
    return '📦';
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
            <span>🔍</span>
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
                <Link href="/medicines" key={m.id} className={styles.searchResult}>
                  <span>{m.image}</span>
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
          <Link href="/medicines" className={styles.actionCard} data-reveal="scale" data-delay="0">
            <span className={styles.actionIcon}>💊</span>
            <strong>Order Medicines</strong>
            <small>Browse & order</small>
          </Link>
          <Link href="/prescriptions" className={styles.actionCard} data-reveal="scale" data-delay="80">
            <span className={styles.actionIcon}>📋</span>
            <strong>Upload Prescription</strong>
            <small>Quick upload</small>
          </Link>
          <Link href="/salt-compare" className={styles.actionCard} data-reveal="scale" data-delay="160">
            <span className={styles.actionIcon}>🔬</span>
            <strong>Salt Compare</strong>
            <small>Find alternatives</small>
          </Link>
          <Link href="/subscription" className={styles.actionCard} data-reveal="scale" data-delay="240">
            <span className={styles.actionIcon}>🔄</span>
            <strong>Auto-Refill</strong>
            <small>{user.isSubscriber ? 'Manage refills' : 'Subscribe now'}</small>
          </Link>
        </div>

        <div className={styles.grid}>
          {/* Recent Orders */}
          <div className={styles.section} ref={ordersRef}>
            <div className={styles.sectionHeader} data-reveal="true" data-delay="0">
              <h2>📦 Recent Orders</h2>
              <Link href="/medicines" className={styles.viewAll}>View All →</Link>
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
                  <span className={styles.subIcon}>✨</span>
                  <h3>MediFly Pro Active</h3>
                  <p>Valid till {new Date(user.subscriptionExpiry).toLocaleDateString()}</p>
                  <Link href="/subscription" className="btn btn-secondary btn-sm" style={{marginTop:'var(--space-3)'}}>Manage →</Link>
                </>
              ) : (
                <>
                  <span className={styles.subIcon}>🔄</span>
                  <h3>Upgrade to Pro</h3>
                  <p>Save on every order with auto-refill</p>
                  <Link href="/subscription" className="btn btn-primary btn-sm" style={{marginTop:'var(--space-3)'}}>Subscribe — ₹99/mo →</Link>
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
