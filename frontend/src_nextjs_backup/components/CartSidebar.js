'use client';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from './CartSidebar.module.css';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, totalItems, subtotal, hasColdChain, hasRx } = useCart();
  const { user } = useAuth();
  const isSub = user?.isSubscriber;

  const platformFee = isSub ? 2 : 6;
  const deliveryFee = subtotal > 500 ? 20 : 40;
  const coldChainFee = hasColdChain ? (isSub ? 9 : 15) : 0;
  const total = subtotal + platformFee + deliveryFee + coldChainFee;

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h3>🛒 Your Cart ({totalItems})</h3>
          <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛒</span>
            <p>Your cart is empty</p>
            <Link href="/medicines" className="btn btn-primary btn-sm" onClick={() => setIsOpen(false)}>
              Browse Medicines
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map(item => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemIcon}>{item.image || '💊'}</div>
                  <div className={styles.itemInfo}>
                    <strong className={styles.itemName}>{item.name}</strong>
                    <span className={styles.itemSalt}>{item.salt}</span>
                    <span className={styles.itemPrice}>₹{item.price}</span>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>

            {hasRx && (
              <div className={styles.rxWarning}>
                ⚠️ Some items require a valid prescription
              </div>
            )}

            <div className={styles.breakdown}>
              <div className={styles.feeRow}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className={styles.feeRow}>
                <span>Platform fee {isSub && <span className="badge badge-teal" style={{marginLeft: 4}}>Pro</span>}</span>
                <span>₹{platformFee}</span>
              </div>
              <div className={styles.feeRow}>
                <span>Delivery fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              {coldChainFee > 0 && (
                <div className={styles.feeRow}>
                  <span>❄️ Cold chain fee {isSub && <span className="badge badge-teal" style={{marginLeft: 4}}>Pro</span>}</span>
                  <span>₹{coldChainFee}</span>
                </div>
              )}
              <div className={`${styles.feeRow} ${styles.totalRow}`}>
                <strong>Total</strong>
                <strong>₹{total}</strong>
              </div>
            </div>

            <div className={styles.actions}>
              <Link href="/checkout" className="btn btn-primary btn-lg" style={{width: '100%'}} onClick={() => setIsOpen(false)}>
                Proceed to Checkout
              </Link>
              {!isSub && (
                <p className={styles.saveTip}>💡 Save more with MediFly Pro subscription</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
