import { useState, useEffect } from 'react';
import styles from './PharmacyPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { useAuth } from '@/context/AuthContext';
import { Package, CheckCircle2, Hospital } from 'lucide-react';

export default function PharmacyPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const { apiCall } = useAuth();

  const pageRef    = useScrollReveal(0.05);
  const contentRef = useScrollReveal(0.08);

  useEffect(() => {
    apiCall('/api/pharmacy/dashboard')
      .then(data => {
        if (data && data.orders) {
          setOrders(data.orders);
        }
      })
      .catch(err => console.warn('Pharmacy dashboard error:', err.message));
  }, [apiCall]);

  return (
    <div className={styles.page}>
      <div className="container" ref={pageRef}>
        <div className={styles.header}>
          <h1><Hospital size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> Partner Pharmacy Portal</h1>
          <p>Fulfill customer prescription orders and manage inventory</p>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <Package size={16} /> Incoming Orders
          </button>
        </div>

        <div className={styles.content} ref={contentRef}>
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Package size={24} /></div>
              <h3>No Pending Orders</h3>
              <p>New orders assigned to your pharmacy location will appear here for fulfillment.</p>
            </div>
          ) : (
            <div className={styles.ordersGrid}>
              {orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <h4>Order #{order.id}</h4>
                  <p>Status: {order.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
