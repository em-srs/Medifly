'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { medicinesData } from '../../data/medicines';
import useScrollReveal from '@/hooks/useScrollReveal';

export default function SaltComparePage() {
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMeds,  setSelectedMeds]  = useState(null);
  const [alternatives,  setAlternatives]  = useState([]);

  const introRef  = useScrollReveal(0.05);
  const compareRef = useScrollReveal(0.08);
  const infoRef   = useScrollReveal(0.08);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const results = medicinesData.filter(med => 
        med.brandName.toLowerCase().includes(query.toLowerCase()) || 
        med.genericName.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Handle Search Result Click
  const selectMedicine = (med) => {
    setSearchQuery(med.brandName);
    setSearchResults([]);
    setSelectedMeds(med);

    // Find all matching alternatives by same Generic/Salt (excluding the selected one itself)
    const alts = medicinesData.filter(
      (m) => m.genericName === med.genericName && m.id !== med.id
    );
    // Sort alternatives by price (ascending) to show cheapest first
    alts.sort((a, b) => a.price - b.price);
    setAlternatives(alts);
  };

  // Handle explicitly clicking the "Compare" button
  const handleCompareClick = () => {
    if (searchResults.length > 0) {
      selectMedicine(searchResults[0]);
    }
  };

  return (
    <div className={styles.pageWrap}>
      <main className={styles.main}>
        {/* Intro Section */}
        <div className={styles.introContainer} ref={introRef}>
          <span className={styles.badgeTop} data-reveal="true" data-delay="0">✨ SALT COMPARISON</span>
          <h1 className={styles.pageTitle} data-reveal="true" data-delay="80">Find Cheaper & Better Alternatives</h1>
          <p className={styles.pageSubtitle} data-reveal="true" data-delay="160">
            Can't find your medicine in nearby pharmacies? MediFly has your back.<br/>
            Compare salt compositions and find trusted substitutes instantly.
          </p>

          <div className={styles.searchBoxWrapper} data-reveal="true" data-delay="240" style={{position: 'relative', maxWidth: '800px', margin: '0 auto'}}>
            <div className={styles.searchBox}>
              <span className={styles.searchIconLg}>🔍</span>
              <input 
                type="text" 
                placeholder="Search for a medicine (e.g. Crocin, Metformin) or salt compos..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button className={`btn btn-primary ${styles.compareBtn}`} onClick={handleCompareClick}>
                Compare
              </button>
            </div>
            
            {/* Live Search Dropdown */}
            {searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginTop: '0.5rem', zIndex: 50, maxHeight: '300px', overflowY: 'auto', textAlign: 'left' }}>
                {searchResults.map((result) => (
                  <div 
                    key={result.id} 
                    onClick={() => selectMedicine(result)}
                    style={{ padding: '1rem', borderBottom: '1px solid var(--slate-100)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--slate-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <strong style={{ display: 'block', color: 'var(--slate-900)' }}>{result.brandName}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{result.genericName}</span>
                    </div>
                    <span style={{ color: 'var(--teal-600)', fontWeight: 'bold' }}>₹{result.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Comparison Section */}
        {selectedMeds && (
          <>
            <div className={styles.comparisonGrid} ref={compareRef}>
              {/* Original Choice */}
              <div className={styles.compareCard} data-reveal="left" data-delay="0">
                <div className={styles.cardTop}>
                  <span className={styles.tagGray}>ORIGINAL CHOICE</span>
                  <span className={styles.iconCheckGray}>✓</span>
                </div>
                
                <div className={styles.drugHeader}>
                  <div className={`${styles.medIcon} ${styles.medIconGray}`}>💊</div>
                  <div>
                    <h2>{selectedMeds.brandName}</h2>
                    <p className={styles.brandNameBlue}>{selectedMeds.manufacturer}</p>
                  </div>
                </div>

                <div className={styles.detailsList}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>SALT COMPOSITION</span>
                    <span className={styles.detailValue}>{selectedMeds.genericName}</span>
                  </div>
                  
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>STRENGTH / FORM</span>
                    <span className={styles.detailValue}>
                      {selectedMeds.strength} ({selectedMeds.form})
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>PRICE</span>
                    <span className={styles.detailValue}>
                      <strong>₹{selectedMeds.price.toFixed(2)}</strong> <span className={styles.perUnit}>/ {selectedMeds.packSize}</span>
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>PRESCRIPTION REQUIREMENT</span>
                    <span className={styles.detailValue}>
                      {selectedMeds.requiresPrescription ? 'Required (Rx)' : 'Not Required (OTC)'}
                    </span>
                  </div>
                </div>

                <button className={`btn btn-secondary ${styles.notifyBtn}`}>
                  Add to Cart
                </button>
              </div>

              {/* Recommended Alternative (Cheapest Option) */}
              {alternatives.length > 0 ? (
                <div className={`${styles.compareCard} ${styles.recommendedCard}`} data-reveal="right" data-delay="100">
                  <div className={styles.cardTop}>
                    <span className={styles.tagMatch}>98% MATCH</span>
                    <span className={styles.tagRecommend}>RECOMMENDED ALTERNATIVE</span>
                  </div>
                  
                  <div className={styles.drugHeader}>
                    <div className={`${styles.medIcon} ${styles.medIconTeal}`}>💊</div>
                    <div>
                      <h2>{alternatives[0].brandName}</h2>
                      <p className={styles.brandNameTeal}>{alternatives[0].manufacturer}</p>
                    </div>
                  </div>

                  <div className={styles.detailsList}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>SALT COMPOSITION</span>
                      <span className={styles.detailValue}>{alternatives[0].genericName}</span>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>STRENGTH / FORM</span>
                      <span className={styles.detailValue}>
                        {alternatives[0].strength} ({alternatives[0].form})
                        {alternatives[0].strength !== selectedMeds.strength && (
                           <span className={styles.tagHigher}>Differs</span>
                        )}
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>PRICE</span>
                      <span className={styles.detailValue}>
                        <strong>₹{alternatives[0].price.toFixed(2)}</strong> <span className={styles.perUnit}>/ {alternatives[0].packSize}</span>
                        {alternatives[0].price < selectedMeds.price && (
                          <span className={styles.tagSave}>
                            Save {Math.round(((selectedMeds.price - alternatives[0].price) / selectedMeds.price) * 100)}%
                          </span>
                        )}
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>PRESCRIPTION REQUIREMENT</span>
                      <span className={styles.detailValue}>
                        {alternatives[0].requiresPrescription ? 'Required (Rx)' : 'Not Required (OTC)'}
                      </span>
                    </div>
                  </div>

                  <button className={`btn btn-primary ${styles.addCartBtn}`}>
                    🛒 Add Alternative to Cart
                  </button>
                </div>
              ) : (
                <div className={styles.compareCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <p style={{ color: 'var(--slate-500)', textAlign: 'center' }}>No alternatives found for this medicine's salt composition.</p>
                </div>
              )}
            </div>

            {/* Other Alternatives List (excluding the top recommended one) */}
            {alternatives.length > 1 && (
              <div className={styles.otherSec}>
                <h3 className={styles.otherTitle} data-reveal="true" data-delay="0">Other Alternatives for {selectedMeds.genericName}</h3>
                <div className={styles.otherGrid}>
                  {alternatives.slice(1).map((alt, i) => (
                    <div key={alt.id} className={styles.otherCard} data-reveal="scale" data-delay={i * 80}>
                      <div className={styles.otherCardTop}>
                        <h4>{alt.brandName}</h4>
                        <span className={styles.priceGreen}>₹{alt.price.toFixed(2)}</span>
                      </div>
                      <p className={styles.otherDesc}>{alt.manufacturer} • {alt.strength} • In Stock</p>
                      <button className={styles.otherBtn}>Add to Cart</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div className={styles.infoRow} ref={infoRef} style={{ marginTop: selectedMeds ? '4rem' : '0' }}>
          <div className={styles.whyBox} data-reveal="left" data-delay="0">
            <div className={styles.whyHeader}>
              <span className={styles.infoIcon}>ℹ️</span>
              <h3>Why compare salts?</h3>
            </div>
            <p>
              Many medicines share the exact same active pharmaceutical ingredient (salt). Often, the
              same formulation is sold by different brands at vastly different price points or might be
              available when your primary choice is out of stock.
            </p>
            <ul className={styles.whyList}>
              <li><span>✓</span> Save up to 70% on medical expenses</li>
              <li><span>✓</span> Verified pharmaceutical data sources</li>
              <li><span>✓</span> Quick doorstep delivery for all alternatives</li>
            </ul>
          </div>

          <div className={styles.helpBox} data-reveal="right" data-delay="80">
            <h3>Need help?</h3>
            <div className={styles.consultBtn}>
              <div className={styles.consultIcon}>💬</div>
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
