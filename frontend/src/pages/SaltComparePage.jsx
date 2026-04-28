import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './SaltComparePage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Info, ShoppingCart, Check, Sparkles, Pill, Search, MessageSquare, ArrowRight, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function SaltComparePage() {
  const { addItem } = useCart();

  // Medicine 1 (original)
  const [query1,   setQuery1]   = useState('');
  const [results1, setResults1] = useState([]);
  const [med1,     setMed1]     = useState(null);

  // Medicine 2 (alternative — user-chosen or auto-suggested)
  const [query2,   setQuery2]   = useState('');
  const [results2, setResults2] = useState([]);
  const [med2,     setMed2]     = useState(null);

  // All salt-matched alternatives for Medicine 1
  const [alternatives, setAlternatives] = useState([]);
  const [autoSuggested, setAutoSuggested] = useState(false);

  const [medicinesData, setMedicinesData] = useState([]);

  useEffect(() => {
    fetch('/medicines.json')
      .then(res => res.json())
      .then(data => setMedicinesData(data))
      .catch(err => console.error(err));
  }, []);

  const mainRef = useScrollReveal(0.01);

  // --- Search helpers ---
  const doSearch = (query, exclude = null) => {
    if (query.trim().length < 2) return [];
    return medicinesData.filter(med =>
      (med.brandName.toLowerCase().includes(query.toLowerCase()) ||
       med.genericName.toLowerCase().includes(query.toLowerCase())) &&
      (!exclude || med.id !== exclude.id)
    );
  };

  // Search 1 change
  const handleSearch1 = (e) => {
    const q = e.target.value;
    setQuery1(q);
    setResults1(doSearch(q));
    // Reset downstream state if user edits Medicine 1
    if (med1) {
      setMed1(null);
      setMed2(null);
      setQuery2('');
      setAlternatives([]);
      setAutoSuggested(false);
    }
  };

  // Select Medicine 1
  const selectMed1 = (med) => {
    setQuery1(med.brandName);
    setResults1([]);
    setMed1(med);
    setMed2(null);
    setQuery2('');
    setAutoSuggested(false);

    // Pre-compute alternatives for "Suggest" button
    const alts = medicinesData
      .filter(m => m.genericName === med.genericName && m.id !== med.id)
      .sort((a, b) => a.price - b.price);
    setAlternatives(alts);
  };

  // Search 2 change (filter to same-salt medicines only)
  const handleSearch2 = (e) => {
    const q = e.target.value;
    setQuery2(q);
    setAutoSuggested(false);
    if (q.trim().length < 2) { setResults2([]); setMed2(null); return; }
    // Show all medicines matching the query (user might want to compare across salts too)
    const res = medicinesData.filter(med =>
      (med.brandName.toLowerCase().includes(q.toLowerCase()) ||
       med.genericName.toLowerCase().includes(q.toLowerCase())) &&
      med.id !== med1?.id
    );
    setResults2(res);
    setMed2(null);
  };

  // Select Medicine 2
  const selectMed2 = (med) => {
    setQuery2(med.brandName);
    setResults2([]);
    setMed2(med);
    setAutoSuggested(false);
  };

  // "Suggest Alternatives" — auto-pick cheapest same-salt alternative
  const handleSuggest = () => {
    if (alternatives.length > 0) {
      setMed2(alternatives[0]);
      setQuery2(alternatives[0].brandName);
      setAutoSuggested(true);
    }
  };

  // Compare button
  const handleCompare = () => {
    if (!med1 && query1.trim()) {
      const match = medicinesData.find(m =>
        m.brandName?.toLowerCase().includes(query1.toLowerCase().trim()) ||
        m.genericName?.toLowerCase().includes(query1.toLowerCase().trim())
      );
      if (match) selectMed1(match);
    }
  };

  // Cart helper
  const toCartItem = (med) => ({
    id: med.id,
    name: med.brandName || med.name,
    salt: med.genericName || med.salt,
    strength: med.strength,
    price: med.price,
    manufacturer: med.manufacturer,
    stock: true,
    image: med.image,
  });

  // Is the salt the same?
  const isSameSalt = med1 && med2 && med1.genericName === med2.genericName;

  return (
    <div className={styles.pageWrap}>
      <main className={styles.main} ref={mainRef}>
        {/* Intro Section */}
        <div className={styles.introContainer}>
          <span className={styles.badgeTop} data-reveal="true" data-delay="0"><Sparkles size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> SALT COMPARISON</span>
          <h1 className={styles.pageTitle} data-reveal="true" data-delay="50">Compare Two Medicines Side by Side</h1>
          <p className={styles.pageSubtitle} data-reveal="true" data-delay="100">
            Enter both medicines you want to compare. Don't have an alternative in mind?<br/>
            Let us suggest the best one based on salt composition.
          </p>
        </div>

        {/* Two Search Boxes */}
        <div className={styles.dualSearchRow} data-reveal="true" data-delay="150">
          {/* Medicine 1 */}
          <div className={styles.searchColumn}>
            <label className={styles.searchLabel}>
              <span className={styles.stepBadge}>1</span>
              Your Medicine
            </label>
            <div className={styles.searchBoxWrapper}>
              <div className={styles.searchBox}>
                <span className={styles.searchIconLg}><Search size={16} /></span>
                <input
                  type="text"
                  placeholder="e.g. Crocin, Metformin..."
                  value={query1}
                  onChange={handleSearch1}
                />
              </div>
              {results1.length > 0 && (
                <div className={styles.dropdown}>
                  {results1.slice(0, 8).map((r) => (
                    <div key={r.id} className={styles.dropdownItem} onClick={() => selectMed1(r)}>
                      <div>
                        <strong>{r.brandName}</strong>
                        <span className={styles.dropdownSub}>{r.genericName} • {r.manufacturer}</span>
                      </div>
                      <span className={styles.dropdownPrice}>₹{Number(r.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {med1 && (
              <div className={styles.selectedChip}>
                <Pill size={14} /> <strong>{med1.brandName}</strong> — {med1.genericName}
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className={styles.vsCircle}>
            <ArrowRight size={20} />
          </div>

          {/* Medicine 2 */}
          <div className={styles.searchColumn}>
            <label className={styles.searchLabel}>
              <span className={styles.stepBadge}>2</span>
              Alternative Medicine
            </label>
            <div className={styles.searchBoxWrapper}>
              <div className={`${styles.searchBox} ${!med1 ? styles.searchDisabled : ''}`}>
                <span className={styles.searchIconLg}><Search size={16} /></span>
                <input
                  type="text"
                  placeholder={med1 ? "Search for an alternative..." : "Select Medicine 1 first"}
                  value={query2}
                  onChange={handleSearch2}
                  disabled={!med1}
                />
              </div>
              {results2.length > 0 && (
                <div className={styles.dropdown}>
                  {results2.slice(0, 8).map((r) => (
                    <div key={r.id} className={styles.dropdownItem} onClick={() => selectMed2(r)}>
                      <div>
                        <strong>{r.brandName}</strong>
                        <span className={styles.dropdownSub}>{r.genericName} • {r.manufacturer}</span>
                      </div>
                      <span className={styles.dropdownPrice}>₹{Number(r.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {med1 && !med2 && alternatives.length > 0 && (
              <button className={styles.suggestBtn} onClick={handleSuggest}>
                <Zap size={14} /> Don't know? Suggest best alternative
              </button>
            )}
            {med2 && (
              <div className={`${styles.selectedChip} ${styles.selectedChipAlt}`}>
                <Pill size={14} /> <strong>{med2.brandName}</strong> — {med2.genericName}
                {isSameSalt && <span className={styles.matchTag}>Same Salt ✓</span>}
              </div>
            )}
          </div>
        </div>

        {/* Comparison Cards */}
        {med1 && med2 && (
          <>
            {/* Salt match banner */}
            {isSameSalt ? (
              <div className={styles.matchBanner} data-reveal="true" data-delay="0">
                <Check size={18} /> <strong>Same active ingredient:</strong> Both contain {med1.genericName}. Safe to substitute under doctor's advice.
              </div>
            ) : (
              <div className={`${styles.matchBanner} ${styles.matchBannerWarn}`} data-reveal="true" data-delay="0">
                <Info size={18} /> <strong>Different salts:</strong> {med1.genericName} vs {med2.genericName}. Consult your doctor before switching.
              </div>
            )}

            <div className={styles.comparisonGrid} data-reveal="true" data-delay="50">
              {/* Medicine 1 Card */}
              <div className={styles.compareCard}>
                <div className={styles.cardTop}>
                  <span className={styles.tagGray}>YOUR MEDICINE</span>
                  <span className={styles.iconCheckGray}><Check size={18} /></span>
                </div>
                <div className={styles.drugHeader}>
                  <div className={`${styles.medIcon} ${styles.medIconGray}`}><Pill size={20} /></div>
                  <div>
                    <h2>{med1.brandName}</h2>
                    <p className={styles.brandNameBlue}>{med1.manufacturer}</p>
                  </div>
                </div>
                <div className={styles.detailsList}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>SALT COMPOSITION</span>
                    <span className={styles.detailValue}>{med1.genericName}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>STRENGTH / FORM</span>
                    <span className={styles.detailValue}>{med1.strength} ({med1.form})</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>PRICE</span>
                    <span className={styles.detailValue}>
                      <strong>₹{med1.price.toFixed(2)}</strong>
                      <span className={styles.perUnit}>/ {med1.packSize}</span>
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>PRESCRIPTION</span>
                    <span className={styles.detailValue}>{med1.requiresPrescription ? 'Required (Rx)' : 'OTC'}</span>
                  </div>
                </div>
                <button className={`btn btn-secondary ${styles.notifyBtn}`} onClick={() => addItem(toCartItem(med1))}>
                  Add to Cart
                </button>
              </div>

              {/* Medicine 2 Card */}
              <div className={`${styles.compareCard} ${isSameSalt ? styles.recommendedCard : styles.warnCard}`}>
                <div className={styles.cardTop}>
                  {isSameSalt && <span className={styles.tagMatch}>SAME SALT</span>}
                  {autoSuggested && <span className={styles.tagRecommend}>AUTO-SUGGESTED</span>}
                  {!isSameSalt && !autoSuggested && <span className={styles.tagGray}>ALTERNATIVE</span>}
                </div>
                <div className={styles.drugHeader}>
                  <div className={`${styles.medIcon} ${isSameSalt ? styles.medIconTeal : styles.medIconGray}`}><Pill size={20} /></div>
                  <div>
                    <h2>{med2.brandName}</h2>
                    <p className={isSameSalt ? styles.brandNameTeal : styles.brandNameBlue}>{med2.manufacturer}</p>
                  </div>
                </div>
                <div className={styles.detailsList}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>SALT COMPOSITION</span>
                    <span className={styles.detailValue}>{med2.genericName}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>STRENGTH / FORM</span>
                    <span className={styles.detailValue}>
                      {med2.strength} ({med2.form})
                      {med2.strength !== med1.strength && <span className={styles.tagHigher}>Differs</span>}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>PRICE</span>
                    <span className={styles.detailValue}>
                      <strong>₹{med2.price.toFixed(2)}</strong>
                      <span className={styles.perUnit}>/ {med2.packSize}</span>
                      {med2.price < med1.price && (
                        <span className={styles.tagSave}>
                          Save {Math.round(((med1.price - med2.price) / med1.price) * 100)}%
                        </span>
                      )}
                      {med2.price > med1.price && (
                        <span className={styles.tagExpensive}>
                          +{Math.round(((med2.price - med1.price) / med1.price) * 100)}% more
                        </span>
                      )}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>PRESCRIPTION</span>
                    <span className={styles.detailValue}>{med2.requiresPrescription ? 'Required (Rx)' : 'OTC'}</span>
                  </div>
                </div>
                <button className={`btn btn-primary ${styles.addCartBtn}`} onClick={() => addItem(toCartItem(med2))}>
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </div>

            {/* Other Same-Salt Alternatives (only if auto-suggested or salt matches) */}
            {isSameSalt && alternatives.length > 1 && (
              <div className={styles.otherSec} data-reveal="true" data-delay="100">
                <h3 className={styles.otherTitle}>Other {med1.genericName} Alternatives</h3>
                <div className={styles.otherGrid}>
                  {alternatives
                    .filter(a => a.id !== med2.id)
                    .slice(0, 6)
                    .map((alt, i) => (
                    <div key={alt.id} className={styles.otherCard} data-reveal="scale" data-delay={i * 60}>
                      <div className={styles.otherCardHeader}>
                        <div className={styles.otherCardIcon}><Pill size={16} /></div>
                        <div className={styles.otherCardInfo}>
                          <h4>{alt.brandName}</h4>
                          <span className={styles.otherMfr}>{alt.manufacturer}</span>
                        </div>
                        <span className={styles.priceGreen}>₹{alt.price.toFixed(2)}</span>
                      </div>
                      <div className={styles.otherCardMeta}>
                        <span>{alt.genericName}</span>
                        <span className={styles.otherDot}>•</span>
                        <span>{alt.strength}</span>
                        <span className={styles.otherDot}>•</span>
                        <span className={styles.otherStock}>In Stock</span>
                      </div>
                      <div className={styles.otherCardActions}>
                        <button className={styles.otherCompareBtn} onClick={() => selectMed2(alt)}>
                          Compare
                        </button>
                        <button className={styles.otherAddBtn} onClick={() => addItem(toCartItem(alt))}>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div className={styles.infoRow} style={{ marginTop: (med1 && med2) ? '4rem' : '0' }}>
          <div className={styles.whyBox} data-reveal="left" data-delay="0">
            <div className={styles.whyHeader}>
              <span className={styles.infoIcon}><Info size={18} /></span>
              <h3>Why compare salts?</h3>
            </div>
            <p>
              Many medicines share the exact same active pharmaceutical ingredient (salt). Often, the
              same formulation is sold by different brands at vastly different price points or might be
              available when your primary choice is out of stock.
            </p>
            <ul className={styles.whyList}>
              <li><span><Check size={16} /></span> Save up to 70% on medical expenses</li>
              <li><span><Check size={16} /></span> Verified pharmaceutical data sources</li>
              <li><span><Check size={16} /></span> Quick doorstep delivery for all alternatives</li>
            </ul>
          </div>

          <div className={styles.helpBox} data-reveal="right" data-delay="80">
            <h3>Need help?</h3>
            <div className={styles.consultBtn}>
              <div className={styles.consultIcon}><MessageSquare size={18} /></div>
              <div className={styles.consultText}>
                <strong>Consult a Pharmacist</strong>
                <span>Available 24/7</span>
              </div>
            </div>
            <button className={styles.chatBtn}>Chat Now</button>
          </div>
        </div>
      </main>
    </div>
  );
}
