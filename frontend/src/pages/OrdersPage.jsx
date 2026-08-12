import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './OrdersPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { useAuth } from '@/context/AuthContext';
import { 
  Map, Home, ShoppingBag, Folder, ShoppingCart, User, Settings, 
  Snowflake, MapPin, Truck, RefreshCw, CheckCircle2, Clock, Package, 
  X, FileText, IndianRupee 
} from 'lucide-react';

const MOCK_ORDERS = [
  {
    id: 'MF-2026-9378',
    date: '28 Jan 2026',
    total: '₹2,100',
    status: 'OUT FOR DELIVERY',
    items: '1× Insulin Glargine 100 IU/ml (Lantus) — Cold Chain Required',
    address: 'Delivering to Goregaon East, Mumbai',
    rider: 'Rider: Vikram Chavan · ETA 22 mins',
    coldChain: true,
  },
  {
    id: 'MF-2026-9341',
    date: '14 Jan 2026',
    total: '₹340',
    status: 'DELIVERED',
    items: '1× Atorvastatin 20mg (Lipvas) · 2× Metformin 500mg ER (Glycomet SR)',
    address: 'Delivered to Andheri West, Mumbai',
    rider: null,
    coldChain: false,
  },
  {
    id: 'MF-2025-9290',
    date: '02 Dec 2025',
    total: '₹189',
    status: 'DELIVERED',
    items: '1× Telma 40 (Telmisartan) · 1× Ecosprin 75mg',
    address: 'Delivered to Bandra West, Mumbai',
    rider: null,
    coldChain: false,
  },
];

export default function OrdersPage() {
  const pathname = useLocation().pathname;
  const { apiCall } = useAuth();
  const contentRef = useScrollReveal(0.08);

  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    apiCall('/api/orders/myorders')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(o => ({
            id: o.id || o._id,
            date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            total: `₹${(o.totalPrice || 0).toLocaleString()}`,
            status: (o.status || (o.isDelivered ? 'DELIVERED' : 'PROCESSING')).toUpperCase(),
            items: (o.orderItems || []).map(i => `${i.qty}× ${i.name}`).join(' · ') || 'Prescription Medication',
            address: o.shippingAddress?.address ? `${o.shippingAddress.address}, ${o.shippingAddress.city || ''}` : 'Delivered to Register Address',
            rider: o.rider ? 'Fleet Rider Assigned · Delivery in progress' : null,
            coldChain: o.coldChainFee > 0,
            raw: o
          }));
          setOrders(formatted);
        }
      })
      .catch(() => {
        // Fallback to MOCK_ORDERS
      });
  }, [apiCall]);

  const getStatusClass = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) return styles.statusDelivered;
    if (s.includes('OUT') || s.includes('DELIVERY') || s.includes('TRANSIT')) return styles.statusOutForDelivery;
    return styles.statusProcessing;
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) return <CheckCircle2 size={14} />;
    if (s.includes('OUT') || s.includes('DELIVERY') || s.includes('TRANSIT')) return <Truck size={14} />;
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
                      <span className={styles.etaBadge}>Live Tracking Active</span>
                    </div>
                  )}
                </div>

                {/* Order Footer Actions */}
                <div className={styles.orderFooter}>
                  {order.status.includes('OUT') && (
                    <button className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
                      <Map size={15} /> Track Live
                    </button>
                  )}
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ gap: '6px' }}
                    onClick={() => setSelectedReceipt(order)}
                  >
                    <FileText size={15} /> View Receipt
                  </button>
                  {order.status.includes('DELIVERED') && (
                    <button className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
                      <RefreshCw size={14} /> Reorder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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
                <strong style={{ color: 'var(--slate-800)' }}>Order ID:</strong> {selectedReceipt.id}
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
