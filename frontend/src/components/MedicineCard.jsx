import { useCart } from '@/context/CartContext';
import { useState, useCallback, memo } from 'react';
import styles from './MedicineCard.module.css';
import { TestTubes, Check, Zap, Snowflake, Pill } from 'lucide-react';


function MedicineCard({ medicine, onCompare }) {
  const { addItem } = useCart();
  const m = medicine;

  // 'idle' | 'adding' | 'added'
  const [addState, setAddState] = useState('idle');

  const handleAdd = useCallback(() => {
    if (addState !== 'idle') return;

    // 1. Brief "adding" flash (button shrinks + spins) — 180 ms
    setAddState('adding');

    setTimeout(() => {
      addItem(m);          // actually add to cart
      setAddState('added');  // show <Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Added

      // 2. After 900 ms reset back to idle
      setTimeout(() => setAddState('idle'), 900);
    }, 180);
  }, [addState, addItem, m]);

  const btnClass = [
    'btn btn-sm',
    styles.addBtn,
    addState === 'adding' ? styles.addBtnAdding : '',
    addState === 'added'  ? styles.addBtnAdded  : '',
    addState === 'idle'   ? 'btn-primary'        : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.card} ${addState === 'added' ? styles.cardFlash : ''}`}>
      {/* Ripple burst overlay — visible only during "adding" */}
      {addState === 'adding' && <span className={styles.burst} aria-hidden="true" />}

      {m.image ? (
        <div className={styles.imageWrapper}>
          <img src={m.image} alt={m.name} className={styles.image} />
        </div>
      ) : (
        <div className={styles.iconWrapper}>
          <span className={styles.icon}><Pill size={32} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.badges}>
          {m.coldChain           && <span className={`badge badge-blue ${styles.badge}`}><Snowflake size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Cold Chain</span>}
          {m.prescriptionRequired && <span className={`badge badge-yellow ${styles.badge}`}>Rx Required</span>}
          {!m.stock              && <span className={`badge badge-red ${styles.badge}`}>Out of Stock</span>}
        </div>
      </div>

      <div className={styles.body}>
        <h4 className={styles.name}>{m.name}</h4>
        <p className={styles.salt}>{m.salt} • {m.strength}</p>
        <p className={styles.manufacturer}>{m.manufacturer}</p>
      </div>

      <div className={styles.delivery}>
        {m.stock ? (
          m.deliveryTimes.map(t => (
            <span key={t} className={styles.deliveryTag}><Zap size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {t}</span>
          ))
        ) : (
          <span className={styles.unavailable}>Check alternatives</span>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.pricing}>
          <span className={styles.price}>₹{m.price}</span>
          {m.mrp > m.price && (
            <>
              <span className={styles.mrp}>₹{m.mrp}</span>
              <span className={styles.discount}>{Math.round((1 - m.price / m.mrp) * 100)}% off</span>
            </>
          )}
        </div>
        <div className={styles.actions}>
          {onCompare && (
            <button className="btn btn-ghost btn-sm" onClick={() => onCompare(m)} title="Compare">
              <TestTubes size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
            </button>
          )}
          <button
            className={btnClass}
            onClick={handleAdd}
            disabled={!m.stock || addState !== 'idle'}
            aria-label={addState === 'added' ? 'Added to cart' : 'Add to cart'}
          >
            {addState === 'added'  && <span className={styles.checkIcon}><Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>}
            {addState === 'adding' && <span className={styles.spinnerIcon}>↻</span>}
            {addState === 'added'  ? 'Added!' : addState === 'adding' ? '…' : m.stock ? '+ Add' : 'N/A'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(MedicineCard);
