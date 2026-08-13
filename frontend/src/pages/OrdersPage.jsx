import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './OrdersPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { useAuth } from '@/context/AuthContext';
import { 
  Map, Home, ShoppingBag, Folder, ShoppingCart, User, Settings, 
  Snowflake, MapPin, Truck, RefreshCw, CheckCircle2, Clock, Package, 
  X, FileText
} from 'lucide-react';

export default function OrdersPage() {
  const pathname = useLocation().pathname;
  const { apiCall } = useAuth();
  const contentRef = useScrollReveal(0.08);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    apiCall('/api/orders/myorders')
      .then(data => {
        if (isMounted) {
          if (Array.isArray(data)) {
            const formatted = data.map(o => ({
              id: o.id || o._id,
              date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              total: `₹${(o.totalPrice || o.total_price || 0).toFixed(2)}`,
              status: (o.status || (o.isDelivered ? 'DELIVERED' : 'PROCESSING')).toUpperCase(),
              items: (o.orderItems || o.items || []).map(i => `${i.qty}× ${i.name}`).join(' · ') || 'Prescription Medicines',
              address: o.shippingAddress?.address ? `${o.shippingAddress.address}, ${o.shippingAddress.city || ''}` : 'Delivered to Registered Address',
              rider: o.rider_name ? `Assigned Rider: ${o.rider_name}` : null,
              coldChain: o.coldChainFee > 0 || o.cold_chain_fee > 0,
              raw: o
            }));
            setOrders(formatted);
          } else {
            setOrders([]);
          }
        }
      })
      .catch(err => {
        console.warn('Could not fetch orders:', err.message);
        if (isMounted) {
          setError(err.message || 'Failed to load order history');
          setOrders([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [apiCall]);

  const getStatusClass = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) return styles.statusDelivered;
    if (s.includes('OUT') || s.includes('DELIVERY') || s.includes('TRANSIT') || s.includes('DISPATCHED')) return styles.statusOutForDelivery;
    return styles.statusProcessing;
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) return <CheckCircle2 size={14} />;
    if (s.includes('OUT') || s.includes('DELIVERY') || s.includes('TRANSIT') || s.includes('DISPATCHED')) return <Truck size={14} />;
    return <Clock size={14} />;
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--slate-800)', margin: '0' }}>Dashboard</h2>
        </div>
        <nav className={styles.sidebarNav}>
          {[
            ['/', <Home size={18} key="home" />, 'Home'],
            ['/prescriptions', <Folder size={18} key="vault" />, 'Vault'],
            ['/orders', <ShoppingBag size={18} key="orders" />, 'Orders'],
            ['/profile', <User size={18} key="profile" />, 'Profile'],
            ['/settings', <Settings size={18} key="settings" />, 'Settings']
          ].map(([href, icon, label]) => (
            <Link key={href} to={href} className={`${styles.navItem} ${pathname === href ? styles.navActive : ''}`}>
              <span className={styles.navIcon}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Container */}
      <main className={styles.main}>
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerShieldIcon}><ShoppingBag size={20} /></span>
            <h2>Order Management</h2>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className={styles.content} ref={contentRef}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Your Orders</h1>
              <p className={styles.pageSubtitle}>Track and manage your doorstep medicine deliveries</p>
            </div>
            <div className={styles.statsSummary}>
              <span className={styles.statBadge}>
                <Package size={14} style={{ color: 'var(--teal-600)' }} /> Total Orders: <strong>{orders.length}</strong>
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Loading your order history...</p>
            </div>
          ) : error ? (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#991b1b' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>{error}</p>
              <button onClick={() => window.location.reload()} className="btn btn-outline btn-sm">Retry</button>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center' }}>
              <Package size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.2rem' }}>No orders placed yet</h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>Your medicine orders will appear here once placed.</p>
              <Link to="/medicines" className="btn btn-primary">Browse Shop & Order Medicines →</Link>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order, i) => (
                <div key={order.id || i} className={styles.orderCard} data-reveal="true" data-delay={i * 60}>
                  {/* Order Header */}
                  <div className={styles.orderCardHeader}>
                    <div className={styles.orderMeta}>
                      <div className={styles.orderIdRow}>
                        <span className={styles.orderId}>Order #{order.id}</span>
                      </div>
                      <span className={styles.orderDate}>
                        Placed on: {order.date} &nbsp;·&nbsp; Total: <strong className={styles.orderTotal}>{order.total}</strong>
                      </span>
                    </div>

                    <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>

                  {/* Order Body Details */}
                  <div className={styles.orderBody}>
                    <div className={styles.orderDetailRow}>
                      <ShoppingCart size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        {order.items}
                        {order.coldChain && (
                          <span className="badge badge-blue" style={{ fontSize: '0.7rem', marginLeft: '6px' }}>
                            <Snowflake size={11} style={{ display: 'inline', marginRight: '2px' }} /> Cold Chain
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.orderDetailRow}>
                      <MapPin size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>{order.address}</div>
                    </div>

                    {/* Rider Banner */}
                    {order.rider && (
                      <div className={styles.riderBanner}>
                        <div className={styles.riderInfo}>
                          <Truck size={18} style={{ color: 'var(--teal-600)' }} />
                          <span>{order.rider}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Footer Actions */}
                  <div className={styles.orderFooter}>
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ gap: '6px' }}
                      onClick={() => setSelectedReceipt(order)}
                    >
                      <FileText size={15} /> View Receipt
                    </button>
                    {order.status.includes('DELIVERED') && (
                      <Link to="/medicines" className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
                        <RefreshCw size={14} /> Reorder
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedReceipt(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--slate-900)' }}>Tax Invoice & Receipt</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedReceipt(null)} style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: 'var(--slate-800)' }}>Order ID:</strong> #{selectedReceipt.id}
              </div>
              <div>
                <strong style={{ color: 'var(--slate-800)' }}>Date:</strong> {selectedReceipt.date}
              </div>
              <div>
                <strong style={{ color: 'var(--slate-800)' }}>Delivery Address:</strong> {selectedReceipt.address}
              </div>
              
              <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700, marginBottom: '0.5rem' }}>Items Ordered</div>
                <div style={{ color: 'var(--slate-800)', fontWeight: 500 }}>{selectedReceipt.items}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px dashed var(--slate-200)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Total Amount Paid:</span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--teal-600)' }}>{selectedReceipt.total}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedReceipt(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
