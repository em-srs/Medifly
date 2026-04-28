'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from './page.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';

export default function CheckoutPage() {
  const { items, subtotal, hasColdChain, hasRx, clearCart } = useCart();
  const { user } = useAuth();
  const isSub = user?.isSubscriber;
  const [step, setStep] = useState('review');
  const [address, setAddress] = useState('123, Sector 5, Andheri West, Mumbai 400058');
  const [deliveryType, setDeliveryType] = useState('standard');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const pageRef  = useScrollReveal(0.05);
  const leftRef  = useScrollReveal(0.08);
  const rightRef = useScrollReveal(0.08);

  const platformFee = isSub ? 2 : 6;
  const deliveryFee = subtotal > 500 ? 20 : 40;
  const coldChainFee = hasColdChain ? (isSub ? 9 : 15) : 0;
  const isLateNight = new Date().getHours() >= 22 || new Date().getHours() < 6;
  const lateNightFee = isLateNight ? (isSub ? 0 : 15) : 0;
  const emergencyFee = deliveryType === 'emergency' ? (isSub ? 25 : 50) : 0;
  const total = subtotal + platformFee + deliveryFee + coldChainFee + lateNightFee + emergencyFee;

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    clearCart();
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add medicines to your cart to proceed</p>
            <Link href="/medicines" className="btn btn-primary" style={{marginTop:'1rem'}}>Browse Medicines →</Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.success}>
            <div className={styles.successIcon}>✅</div>
            <h2>Order Placed Successfully!</h2>
            <p className={styles.orderId}>Order ID: MF-{Date.now().toString().slice(-8)}</p>
            <p>Your medicines will be delivered within 1–6 hours. Track your order from the dashboard.</p>
            <div className={styles.successActions}>
              <Link href="/dashboard" className="btn btn-primary btn-lg">📊 Go to Dashboard</Link>
              <Link href="/medicines" className="btn btn-secondary btn-lg">💊 Order More</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container" ref={pageRef}>
        <h1 className={styles.title} data-reveal="true" data-delay="0">Checkout</h1>
        <div className={styles.grid}>
          {/* Left: Order Details */}
          <div className={styles.left} ref={leftRef}>
            {/* Address */}
            <div className={styles.section} data-reveal="left" data-delay="0">
              <h3>📍 Delivery Address</h3>
              <div className={styles.addressCard}>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className={styles.addressInput}
                  rows={2}
                />
              </div>
            </div>

            {/* Delivery Type */}
            <div className={styles.section} data-reveal="left" data-delay="80">
              <h3>🚴 Delivery Type</h3>
              <div className={styles.deliveryOptions}>
                {[
                  { id: 'standard', label: 'Standard', time: '1–6 hours', fee: '₹' + deliveryFee, icon: '📦' },
                  { id: 'express', label: 'Express', time: '30 min – 1 hr', fee: '₹' + (deliveryFee + 20), icon: '⚡' },
                  { id: 'emergency', label: 'Emergency', time: '< 30 min', fee: '₹' + (deliveryFee + emergencyFee), icon: '🚨' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    className={`${styles.deliveryOption} ${deliveryType === opt.id ? styles.deliveryActive : ''}`}
                    onClick={() => setDeliveryType(opt.id)}
                  >
                    <span className={styles.deliveryIcon}>{opt.icon}</span>
                    <strong>{opt.label}</strong>
                    <small>{opt.time}</small>
                    <span className={styles.deliveryFee}>{opt.fee}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className={styles.section} data-reveal="left" data-delay="160">
              <h3>💊 Items ({items.length})</h3>
              <div className={styles.itemList}>
                {items.map(item => (
                  <div key={item.id} className={styles.item}>
                    <span className={styles.itemIcon}>{item.image}</span>
                    <div className={styles.itemInfo}>
                      <strong>{item.name}</strong>
                      <small>{item.salt} • {item.strength}</small>
                    </div>
                    <span className={styles.itemQty}>×{item.qty}</span>
                    <span className={styles.itemPrice}>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {hasRx && (
              <div className={styles.rxBanner}>
                ⚠️ Prescription required for some items. Please ensure you have uploaded a valid prescription.
                <Link href="/prescriptions" style={{marginLeft: 8, fontWeight: 600}}>Upload →</Link>
              </div>
            )}
          </div>

          {/* Right: Price Breakdown */}
          <div className={styles.right} ref={rightRef}>
            <div className={styles.priceCard} data-reveal="right" data-delay="0">
              <h3>Price Breakdown</h3>
              <div className={styles.priceList}>
                <div className={styles.priceRow}><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className={styles.priceRow}>
                  <span>Platform fee {isSub && <span className="badge badge-teal" style={{fontSize:10,marginLeft:4}}>Pro</span>}</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className={styles.priceRow}><span>Delivery fee</span><span>₹{deliveryFee}</span></div>
                {coldChainFee > 0 && (
                  <div className={styles.priceRow}>
                    <span>❄️ Cold chain {isSub && <span className="badge badge-teal" style={{fontSize:10,marginLeft:4}}>Pro</span>}</span>
                    <span>₹{coldChainFee}</span>
                  </div>
                )}
                {lateNightFee > 0 && (
                  <div className={styles.priceRow}><span>🌙 Late night</span><span>₹{lateNightFee}</span></div>
                )}
                {emergencyFee > 0 && (
                  <div className={styles.priceRow}>
                    <span>🚨 Emergency {isSub && <span className="badge badge-teal" style={{fontSize:10,marginLeft:4}}>50% off</span>}</span>
                    <span>₹{emergencyFee}</span>
                  </div>
                )}
                <div className={`${styles.priceRow} ${styles.totalRow}`}>
                  <strong>Total</strong>
                  <strong>₹{total}</strong>
                </div>
              </div>

              {!isSub && (
                <div className={styles.proSave}>
                  💡 MediFly Pro subscribers save ₹{(6-2) + (hasColdChain ? 6 : 0)} on this order
                </div>
              )}

              {/* Payment */}
              <div className={styles.paymentSection}>
                <h4>Payment Method</h4>
                <div className={styles.paymentOptions}>
                  <label className={styles.paymentOption}>
                    <input type="radio" name="payment" defaultChecked /> UPI
                  </label>
                  <label className={styles.paymentOption}>
                    <input type="radio" name="payment" /> Card
                  </label>
                  <label className={styles.paymentOption}>
                    <input type="radio" name="payment" /> COD
                  </label>
                </div>
              </div>

              <button className="btn btn-primary btn-lg" style={{width:'100%'}} onClick={handlePlaceOrder} id="place-order-btn">
                Place Order — ₹{total}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
