import { useState, useEffect } from 'react';
import styles from './AdminPage.module.css';
import { useAuth } from '@/context/AuthContext';
import { Shield, Package, CheckCircle2, AlertTriangle, BarChart3, Users, IndianRupee, Bike, Star, Hospital } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { apiCall } = useAuth();
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    apiCall('/api/admin/dashboard')
      .then(data => {
        if (data && data.stats) {
          setLiveStats(data.stats);
        }
      })
      .catch(err => console.warn('Backend admin dashboard fetch:', err.message));
  }, [apiCall]);

  const stats = {
    totalUsers: liveStats?.users || 0,
    totalOrders: liveStats?.orders || 0,
    totalRevenue: liveStats?.revenue || 0,
    lowStockItems: liveStats?.lowStockItems || 0
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1><Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Admin Panel</h1>
          <p>MediFly Platform Administration & Real-Time Metrics</p>
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
                <div className={styles.statCard}><span><Users size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>{stats.totalUsers.toLocaleString()}</strong><small>Registered Patients</small></div></div>
                <div className={styles.statCard}><span><Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>{stats.totalOrders.toLocaleString()}</strong><small>Total Platform Orders</small></div></div>
                <div className={styles.statCard}><span><IndianRupee size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>₹{stats.totalRevenue.toLocaleString()}</strong><small>Total Platform Revenue</small></div></div>
                <div className={styles.statCard}><span><AlertTriangle size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span><div><strong>{stats.lowStockItems}</strong><small>Low Stock Medicines</small></div></div>
              </div>
            </>
          )}

          {activeTab === 'pharmacies' && (
            <div className="empty-state">
              <div className="empty-state-icon"><Hospital size={24} /></div>
              <h3>Partner Pharmacies</h3>
              <p>Registered partner pharmacies will be listed here.</p>
            </div>
          )}

          {activeTab === 'riders' && (
            <div className="empty-state">
              <div className="empty-state-icon"><Bike size={24} /></div>
              <h3>Fleet Riders</h3>
              <p>Assigned delivery fleet riders will appear here.</p>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="empty-state">
              <div className="empty-state-icon"><Package size={24} /></div>
              <h3>Platform Orders</h3>
              <p>Real-time customer orders will appear here as they are placed.</p>
            </div>
          )}

          {activeTab === 'disputes' && (
            <div className="empty-state">
              <div className="empty-state-icon"><CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
              <h3>No Active Disputes</h3>
              <p>All customer complaints and tickets have been resolved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
