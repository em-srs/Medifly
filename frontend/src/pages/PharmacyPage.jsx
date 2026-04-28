import { useState } from 'react';
import { sampleOrders, samplePrescriptions } from '@/data/mockData';
import styles from './PharmacyPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Package, CheckCircle2, BarChart3, IndianRupee, Pill, Star, Hospital } from 'lucide-react';


const stockData = [
  { id: 1, name: 'Dolo 650', stock: 250, low: false },
  { id: 2, name: 'Pan 40', stock: 45, low: false },
  { id: 3, name: 'Azithral 500', stock: 8, low: true },
  { id: 4, name: 'Lantus Solostar', stock: 3, low: true },
  { id: 5, name: 'Combiflam', stock: 180, low: false },
  { id: 6, name: 'Metformin 500', stock: 120, low: false },
];

export default function PharmacyPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState(sampleOrders.map(o => ({...o, pharmacyAction: null})));

  const pageRef    = useScrollReveal(0.05);
  const contentRef = useScrollReveal(0.08);

  const handleAction = (orderId, action) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {...o, pharmacyAction: action} : o));
  };

  return (
    <div className={styles.page}>
      <div className="container" ref={pageRef}>
        <div className={styles.header} data-reveal="true" data-delay="0">
          <div>
            <h1><Hospital size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Pharmacy Dashboard</h1>
            <p>Apollo Pharmacy — License: DL-2024-DL-7832</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.hStat}><strong>78</strong><span>Orders Today</span></div>
            <div className={styles.hStat}><strong>₹52,000</strong><span>Revenue</span></div>
            <div className={styles.hStat}><strong>4.8 <Star size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></strong><span>Rating</span></div>
          </div>
        </div>

        <div className="tabs">
          {['orders', 'prescriptions', 'stock', 'earnings'].map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'orders' ? <><Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Orders</> : tab === 'prescriptions' ? '📋 Prescriptions' : tab === 'stock' ? <><BarChart3 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Stock</> : <><IndianRupee size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Earnings</>}
            </button>
          ))}
        </div>

        <div className={styles.content} ref={contentRef}>
          {activeTab === 'orders' && (
            <div className={styles.orderList}>
              {orders.map((order, i) => (
                <div key={order.id} className={styles.orderCard} data-reveal="true" data-delay={i * 60}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={`badge ${order.status === 'Delivered' ? 'badge-green' : order.status === 'In Transit' ? 'badge-blue' : 'badge-yellow'}`}>{order.status}</span>
                  </div>
                  <div className={styles.orderItems}>
                    {order.items.map((item, i) => (
                      <div key={i} className={styles.orderItem}>
                        <span><Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {item.name}</span>
                        <span>×{item.qty}</span>
                        <span>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.orderFooter}>
                    <span>Total: ₹{order.total}</span>
                    {!order.pharmacyAction && order.status === 'Processing' && (
                      <div className={styles.orderActions}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleAction(order.id, 'accepted')}><CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Accept</button>
                        <button className="btn btn-ghost btn-sm" style={{color: 'var(--danger)'}} onClick={() => handleAction(order.id, 'rejected')}>❌ Reject</button>
                      </div>
                    )}
                    {order.pharmacyAction && (
                      <span className={`badge ${order.pharmacyAction === 'accepted' ? 'badge-green' : 'badge-red'}`}>
                        {order.pharmacyAction === 'accepted' ? 'Accepted' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className={styles.rxList}>
              {samplePrescriptions.map(rx => (
                <div key={rx.id} className={styles.rxCard}>
                  <div className={styles.rxHeader}>
                    <strong>{rx.id}</strong>
                    <span className={`badge ${rx.status === 'Approved' ? 'badge-green' : 'badge-yellow'}`}>{rx.status}</span>
                  </div>
                  <p>{rx.doctorName} — {rx.hospital}</p>
                  <div className={styles.rxMeds}>
                    {rx.medicines.map(m => <span key={m} className="tag">{m}</span>)}
                  </div>
                  {rx.status === 'Pending' && (
                    <div className={styles.rxActions}>
                      <button className="btn btn-primary btn-sm"><CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Approve</button>
                      <button className="btn btn-ghost btn-sm" style={{color: 'var(--danger)'}}>❌ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'stock' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.stock} units</td>
                    <td><span className={`badge ${item.low ? 'badge-red' : 'badge-green'}`}>{item.low ? 'Low Stock' : 'In Stock'}</span></td>
                    <td><button className="btn btn-ghost btn-sm"><Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Restock</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'earnings' && (
            <div className={styles.earningsGrid}>
              <div className={styles.earningCard}><span><Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>78</strong><small>Orders Today</small></div></div>
              <div className={styles.earningCard}><span><IndianRupee size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>₹52,000</strong><small>Revenue Today</small></div></div>
              <div className={styles.earningCard}><span><BarChart3 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>₹3,82,000</strong><small>This Month</small></div></div>
              <div className={styles.earningCard}><span><Star size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>4.8</strong><small>Rating</small></div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
