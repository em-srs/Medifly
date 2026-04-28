import { useState } from 'react';
import { adminStats, pharmacies, riders, sampleOrders } from '@/data/mockData';
import styles from './AdminPage.module.css';
import { Shield, Package, CheckCircle2, AlertTriangle, Zap, BarChart3, Users, IndianRupee, Bike, Star, Hospital } from 'lucide-react';


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1><Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Admin Panel</h1>
          <p>MediFly Platform Administration</p>
        </div>

        <div className="tabs">
          {['overview', 'pharmacies', 'riders', 'orders', 'disputes'].map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'overview' ? <><BarChart3 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Overview</> : tab === 'pharmacies' ? <><Hospital size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Pharmacies</> : tab === 'riders' ? <><Bike size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Riders</> : tab === 'orders' ? <><Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Orders</> : <><AlertTriangle size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Disputes</>}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {activeTab === 'overview' && (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}><span><Users size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>{adminStats.totalUsers.toLocaleString()}</strong><small>Total Users</small></div></div>
                <div className={styles.statCard}><span><Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>{adminStats.totalOrders.toLocaleString()}</strong><small>Total Orders</small></div></div>
                <div className={styles.statCard}><span><IndianRupee size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>₹{(adminStats.totalRevenue / 100000).toFixed(1)}L</strong><small>Total Revenue</small></div></div>
                <div className={styles.statCard}><span><Hospital size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>{adminStats.activePharmacies}</strong><small>Active Pharmacies</small></div></div>
                <div className={styles.statCard}><span><Bike size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>{adminStats.activeRiders}</strong><small>Active Riders</small></div></div>
                <div className={styles.statCard}><span><Zap size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>{adminStats.avgDeliveryTime}</strong><small>Avg Delivery</small></div></div>
                <div className={styles.statCard}><span><BarChart3 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>{adminStats.slaCompliance}%</strong><small>SLA Compliance</small></div></div>
                <div className={styles.statCard}><span><Star size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>{adminStats.customerSatisfaction}/5</strong><small>Satisfaction</small></div></div>
              </div>

              <div className={styles.todaySection}>
                <h3>Today&apos;s Performance</h3>
                <div className={styles.todayGrid}>
                  <div className={styles.todayCard}>
                    <div className={styles.todayLabel}>Orders Today</div>
                    <div className={styles.todayValue}>{adminStats.ordersToday}</div>
                    <div className={styles.todayChange}>↑ 12% from yesterday</div>
                  </div>
                  <div className={styles.todayCard}>
                    <div className={styles.todayLabel}>Revenue Today</div>
                    <div className={styles.todayValue}>₹{(adminStats.revenueToday / 1000).toFixed(1)}K</div>
                    <div className={styles.todayChange}>↑ 8% from yesterday</div>
                  </div>
                  <div className={styles.todayCard}>
                    <div className={styles.todayLabel}>Active Users</div>
                    <div className={styles.todayValue}>1,247</div>
                    <div className={styles.todayChange}>↑ 5% from yesterday</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'pharmacies' && (
            <table className="data-table">
              <thead>
                <tr><th>Pharmacy</th><th>License</th><th>Orders</th><th>Revenue</th><th>Rating</th><th>Status</th></tr>
              </thead>
              <tbody>
                {pharmacies.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong><br/><small style={{color:'var(--slate-500)'}}>{p.address}</small></td>
                    <td><code style={{fontSize:'var(--text-xs)'}}>{p.license}</code></td>
                    <td>{p.ordersToday}</td>
                    <td>₹{p.revenue.toLocaleString()}</td>
                    <td>{p.rating > 0 ? <>{p.rating} <Star size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></> : '-'}</td>
                    <td>
                      <span className={`badge ${p.verified ? 'badge-green' : 'badge-yellow'}`}>
                        {p.verified ? <><CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Verified</> : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'riders' && (
            <table className="data-table">
              <thead>
                <tr><th>Rider</th><th>Zone</th><th>Deliveries</th><th>Earnings</th><th>Rating</th><th>Status</th></tr>
              </thead>
              <tbody>
                {riders.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong><br/><small style={{color:'var(--slate-500)'}}>{r.phone}</small></td>
                    <td>{r.zone}</td>
                    <td>{r.deliveriesToday}</td>
                    <td>₹{r.earnings}</td>
                    <td>{r.rating} <Star size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></td>
                    <td>
                      <span className={`badge ${r.status === 'Active' ? 'badge-green' : r.status === 'On Delivery' ? 'badge-blue' : 'badge-red'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'orders' && (
            <div className={styles.liveOrders}>
              <h3>📡 Live Orders</h3>
              <div className={styles.ordersList}>
                {sampleOrders.map(order => (
                  <div key={order.id} className={styles.liveOrder}>
                    <div className={styles.liveOrderHeader}>
                      <span>{order.id}</span>
                      <span className={`badge ${order.status === 'Delivered' ? 'badge-green' : order.status === 'In Transit' ? 'badge-blue' : 'badge-yellow'}`}>{order.status}</span>
                    </div>
                    <div className={styles.liveOrderInfo}>
                      <span><Hospital size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {order.pharmacy}</span>
                      {order.rider && <span><Bike size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {order.rider}</span>}
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'disputes' && (
            <div className="empty-state">
              <div className="empty-state-icon"><CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
              <h3>No active disputes</h3>
              <p>All customer complaints have been resolved</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
