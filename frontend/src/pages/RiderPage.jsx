import { useState, useEffect } from 'react';
import styles from './RiderPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { useAuth } from '@/context/AuthContext';
import { Map, Phone, Package, CheckCircle2, Snowflake, MapPin, Bike, Star, Hospital, AlertCircle } from 'lucide-react';

export default function RiderPage() {
  const { user, apiCall } = useAuth();
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const pageRef = useScrollReveal(0.05);
  const cardsRef = useScrollReveal(0.08);

  useEffect(() => {
    if (user) {
      setLoading(true);
      apiCall('/api/rider/deliveries')
        .then(data => {
          if (Array.isArray(data)) {
            setActiveDeliveries(data);
          }
        })
        .catch(err => console.warn('Error fetching rider deliveries:', err.message))
        .finally(() => setLoading(false));
    }
  }, [user, apiCall]);

  const updateStatus = (id, newStatus) => {
    setActiveDeliveries(prev => prev.map(d => d.id === id ? {...d, status: newStatus} : d));
  };

  const totalEarnings = activeDeliveries.reduce((sum, d) => sum + (d.earnings || 0), 0);
  const completed = activeDeliveries.filter(d => d.status === 'Delivered').length;

  return (
    <div className={styles.page}>
      <div className="container" ref={pageRef}>
        <div className={styles.header} data-reveal="true" data-delay="0">
          <div>
            <h1><Bike size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> Fleet Rider Portal</h1>
            <p>{user?.name || 'Rider'} — Delivery Dashboard</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.hStat}><strong>{activeDeliveries.length}</strong><span>Deliveries</span></div>
            <div className={styles.hStat}><strong>{completed}</strong><span>Completed</span></div>
            <div className={styles.hStat}><strong>₹{totalEarnings}</strong><span>Earnings</span></div>
            <div className={styles.hStat}><strong>5.0 <Star size={14} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></strong><span>Rating</span></div>
          </div>
        </div>

        <div className={styles.deliveries} ref={cardsRef}>
          {loading ? (
            <div className="empty-state">Loading assigned deliveries...</div>
          ) : activeDeliveries.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <div className="empty-state-icon" style={{ marginBottom: '1rem' }}><Bike size={36} style={{ color: 'var(--teal-600)' }} /></div>
              <h3>No Assigned Deliveries</h3>
              <p>You currently have 0 active express delivery orders assigned to your shift.</p>
            </div>
          ) : (
            activeDeliveries.map((d, i) => (
              <div key={d.id} className={`${styles.deliveryCard} ${d.status === 'Delivered' ? styles.completed : ''}`} data-reveal="true" data-delay={i * 100}>
                <div className={styles.deliveryHeader}>
                  <div>
                    <span className={styles.deliveryId}>{d.orderId}</span>
                    <span className={`badge ${d.status === 'Delivered' ? 'badge-green' : d.status === 'In Transit' ? 'badge-blue' : 'badge-yellow'}`}>{d.status}</span>
                  </div>
                  {d.coldChain && <span className={styles.coldChainAlert}><Snowflake size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Cold Chain — Handle with care!</span>}
                </div>

                <div className={styles.deliveryBody}>
                  <div className={styles.deliveryRoute}>
                    <div className={styles.routePoint}>
                      <span className={styles.routeDot}><Hospital size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
                      <div><strong>Pickup</strong><small>{d.pharmacy}</small></div>
                    </div>
                    <div className={styles.routeLine} />
                    <div className={styles.routePoint}>
                      <span className={styles.routeDot}><MapPin size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
                      <div><strong>{d.customer}</strong><small>{d.address}</small></div>
                    </div>
                  </div>

                  <div className={styles.deliveryItems}>
                    {(d.items || []).map(item => <span key={item} className="tag">{item}</span>)}
                  </div>

                  <div className={styles.deliveryMeta}>
                    <span>ETA: {d.est}</span>
                    <span>Earning: ₹{d.earnings}</span>
                  </div>
                </div>

                <div className={styles.deliveryActions}>
                  {d.status === 'Pickup' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(d.id, 'In Transit')}>
                        <Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Confirm Pickup
                      </button>
                    </>
                  )}
                  {d.status === 'In Transit' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(d.id, 'Delivered')}>
                        <CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Confirm Delivery
                      </button>
                    </>
                  )}
                  {d.status === 'Delivered' && (
                    <span className={styles.deliveredText}><CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Delivered successfully</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
