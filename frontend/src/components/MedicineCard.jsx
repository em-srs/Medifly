import { useCart } from '@/context/CartContext';
import { useState, useCallback, memo } from 'react';
import styles from './MedicineCard.module.css';
import { TestTubes, Check, Zap, Snowflake, Pill } from 'lucide-react';

function MedicineCard({ medicine, onCompare }) {
  const { addItem } = useCart();
  const m = medicine || {};

  // Normalize property names from both API and static format
  const name = m.brandName || m.name || 'Medicine';
  const salt = m.genericName || m.salt || 'Chemical Salt Composition';
  const strength = m.strength && m.strength !== 'Standard' ? m.strength : '';
  const manufacturer = m.manufacturer || 'Licensed Partner Pharma';
  const price = parseFloat(m.price || 0);
  const mrp = m.mrp ? parseFloat(m.mrp) : Math.round(price * 1.18 * 100) / 100;
  const coldChain = m.coldChainRequired || m.coldChain || false;
  const rxRequired = m.requiresPrescription || m.prescriptionRequired || false;
  const inStock = m.stock !== false && m.inventoryCount !== 0;
  const deliveryTimes = Array.isArray(m.deliveryTimes) ? m.deliveryTimes : ['1 Hour Express', 'Same Day'];
  const image = m.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400';

  // 'idle' | 'adding' | 'added'
  const [addState, setAddState] = useState('idle');

  const handleAdd = useCallback(() => {
    if (addState !== 'idle' || !inStock) return;

    setAddState('adding');
    setTimeout(() => {
      addItem({ ...m, name, price, image });
      setAddState('added');
      setTimeout(() => setAddState('idle'), 900);
    }, 180);
  }, [addState, inStock, addItem, m, name, price, image]);

  const btnClass = [
    'btn btn-sm',
    styles.addBtn,
    addState === 'adding' ? styles.addBtnAdding : '',
    addState === 'added'  ? styles.addBtnAdded  : '',
    addState === 'idle'   ? (inStock ? 'btn-primary' : styles.addBtnDisabled) : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.card} ${addState === 'added' ? styles.cardFlash : ''}`}>
      {addState === 'adding' && <span className={styles.burst} aria-hidden="true" />}

      <div className={styles.imageWrapper} style={{ height: '140px', overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>
        <img 
          src={image} 
          alt={name} 
          className={styles.image} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'; }}
        />
      </div>

      <div className={styles.header} style={{ padding: '8px 12px 0 12px' }}>
        <div className={styles.badges} style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {coldChain && <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}><Snowflake size={12} /> Cold Chain</span>}
          {rxRequired && <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>Rx Required</span>}
          {!inStock && <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>Out of Stock</span>}
        </div>
      </div>

      <div className={styles.body} style={{ padding: '8px 12px' }}>
        <h4 className={styles.name} style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '2px', color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{name}</h4>
        <p className={styles.salt} style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{salt} {strength ? `• ${strength}` : ''}</p>
        <p className={styles.manufacturer} style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{manufacturer}</p>
      </div>

      <div className={styles.delivery} style={{ padding: '0 12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {inStock ? (
          deliveryTimes.map(t => (
            <span key={t} className={styles.deliveryTag} style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', color: '#475569' }}><Zap size={12} style={{ display: 'inline', marginRight: '2px' }} /> {t}</span>
          ))
        ) : (
          <span className={styles.unavailable} style={{ fontSize: '0.75rem', color: '#ef4444' }}>Check alternatives</span>
        )}
      </div>

      <div className={styles.footer} style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div className={styles.pricing}>
          <span className={styles.price} style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0ea5e9' }}>₹{price.toFixed(2)}</span>
          {mrp > price && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span className={styles.mrp} style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: '#94a3b8' }}>₹{mrp.toFixed(2)}</span>
              <span className={styles.discount} style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>{Math.round((1 - price / mrp) * 100)}% off</span>
            </div>
          )}
        </div>
        <div className={styles.actions} style={{ display: 'flex', gap: '4px' }}>
          {onCompare && (
            <button className="btn btn-ghost btn-sm" onClick={() => onCompare(m)} title="Compare Salt">
              <TestTubes size={16} />
            </button>
          )}
          <button
            className={btnClass}
            onClick={handleAdd}
            disabled={!inStock || addState !== 'idle'}
          >
            {addState === 'added'  && <Check size={16} />}
            {addState === 'adding' && '…'}
            {addState === 'added'  ? 'Added!' : addState === 'adding' ? '…' : inStock ? '+ Add' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(MedicineCard);
