import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import styles from './CartSidebar.module.css';
import { ShoppingCart, AlertTriangle, Snowflake, Pill, Lightbulb, Trash2, X } from 'lucide-react';


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
          <h3><ShoppingCart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Your Cart ({totalItems})</h3>
          <button onClick={() => setIsOpen(false)} className={styles.closeBtn}><X size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}><ShoppingCart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            <p>Your cart is empty</p>
            <Link to="/medicines" className="btn btn-primary btn-sm" onClick={() => setIsOpen(false)}>
              Browse Medicines
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map(item => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemIcon}>{item.image ? <img src={item.image} alt={item.name} className={styles.itemImg} /> : <Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />}</div>
                  <div className={styles.itemInfo}>
                    <strong className={styles.itemName}>{item.name}</strong>
                    <span className={styles.itemSalt}>{item.salt}</span>
                    <span className={styles.itemPrice}>₹{Number(item.price).toFixed(2)}</span>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)}><Trash2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
                  </div>
                </div>
              ))}
            </div>

            {hasRx && (
              <div className={styles.rxWarning}>
                <AlertTriangle size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Some items require a valid prescription
              </div>
            )}

            <div className={styles.breakdown}>
              <div className={styles.feeRow}>
                <span>Subtotal</span>
                <span>₹{Number(subtotal).toFixed(2)}</span>
              </div>
              <div className={styles.feeRow}>
                <span>Platform fee {isSub && <span className="badge badge-teal" style={{marginLeft: 4}}>Pro</span>}</span>
                <span>₹{Number(platformFee).toFixed(2)}</span>
              </div>
              <div className={styles.feeRow}>
                <span>Delivery fee</span>
                <span>₹{Number(deliveryFee).toFixed(2)}</span>
              </div>
              {coldChainFee > 0 && (
                <div className={styles.feeRow}>
                  <span><Snowflake size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Cold chain fee {isSub && <span className="badge badge-teal" style={{marginLeft: 4}}>Pro</span>}</span>
                  <span>₹{Number(coldChainFee).toFixed(2)}</span>
                </div>
              )}
              <div className={`${styles.feeRow} ${styles.totalRow}`}>
                <strong>Total</strong>
                <strong>₹{Number(total).toFixed(2)}</strong>
              </div>
            </div>

            <div className={styles.actions}>
              <Link to="/checkout" className="btn btn-primary btn-lg" style={{width: '100%'}} onClick={() => setIsOpen(false)}>
                Proceed to Checkout
              </Link>
              {!isSub && (
                <p className={styles.saveTip}><Lightbulb size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Save more with MediFly Pro subscription</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
