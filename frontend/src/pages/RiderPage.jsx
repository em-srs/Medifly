import { useState } from 'react';
import styles from './RiderPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Map, Phone, Package, CheckCircle2, Snowflake, MapPin, Bike, Star, Hospital } from 'lucide-react';


const deliveries = [
  { id: 'DEL-001', orderId: 'MF-20260308-002', customer: 'Rahul M.', address: 'Sector 5, Andheri West', items: ['Lantus Solostar', 'Metformin 500'], coldChain: true, status: 'Pickup', pharmacy: 'Apollo Pharmacy', est: '15 min', earnings: 65 },
  { id: 'DEL-002', orderId: 'MF-20260308-005', customer: 'Priya S.', address: 'MG Road, Bandra', items: ['Dolo 650', 'Pan 40'], coldChain: false, status: 'In Transit', pharmacy: 'MedPlus', est: '22 min', earnings: 45 },
  { id: 'DEL-003', orderId: 'MF-20260308-006', customer: 'Ankit K.', address: 'Hill Road, Dadar', items: ['Azithral 500'], coldChain: false, status: 'Delivered', pharmacy: 'Netmeds Store', est: '-', earnings: 40 },
];

export default function RiderPage() {
  const [activeDeliveries, setActiveDeliveries] = useState(deliveries);

  const updateStatus = (id, newStatus) => {
    setActiveDeliveries(prev => prev.map(d => d.id === id ? {...d, status: newStatus} : d));
  };

  const totalEarnings = activeDeliveries.reduce((sum, d) => sum + d.earnings, 0);
  const completed = activeDeliveries.filter(d => d.status === 'Delivered').length;

  const pageRef = useScrollReveal(0.05);
  const cardsRef = useScrollReveal(0.08);

  return (
    <div className={styles.page}>
      <div className="container" ref={pageRef}>
        <div className={styles.header} data-reveal="true" data-delay="0">
          <div>
            <h1><Bike size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Rider Dashboard</h1>
            <p>Rajesh Kumar — South Mumbai Zone</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.hStat}><strong>{activeDeliveries.length}</strong><span>Deliveries</span></div>
            <div className={styles.hStat}><strong>{completed}</strong><span>Completed</span></div>
            <div className={styles.hStat}><strong>₹{totalEarnings}</strong><span>Earnings</span></div>
            <div className={styles.hStat}><strong>4.7 <Star size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></strong><span>Rating</span></div>
          </div>
        </div>

        <div className={styles.deliveries} ref={cardsRef}>
          {activeDeliveries.map((d, i) => (
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
                  {d.items.map(item => <span key={item} className="tag">{item}</span>)}
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
                    <button className="btn btn-ghost btn-sm"><Map size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Navigate</button>
                  </>
                )}
                {d.status === 'In Transit' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(d.id, 'Delivered')}>
                      <CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Confirm Delivery
                    </button>
                    <button className="btn btn-ghost btn-sm"><Map size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Navigate</button>
                    <button className="btn btn-ghost btn-sm"><Phone size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Call Customer</button>
                  </>
                )}
                {d.status === 'Delivered' && (
                  <span className={styles.deliveredText}><CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Delivered successfully</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
