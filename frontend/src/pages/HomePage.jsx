import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import MedicineCard from '@/components/MedicineCard';
import { useCart } from '@/context/CartContext';
import { 
  Shield, Award, Lock, RefreshCw, Folder, ShoppingCart, Package, Check, Zap, 
  Snowflake, Search, MapPin, UserCircle2, Hospital, Truck, ArrowRight, TestTubes,
  Clock, Sparkles, ChevronRight, CheckCircle2, AlertCircle, HeartPulse
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default function HomePage() {
  const { addItem } = useCart();

  // Hero Search Widget State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Live Featured Products State
  const [featuredMeds, setFeaturedMeds] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Scroll Reveal Animations
  const heroRef    = useScrollReveal(0.05);
  const slaRef     = useScrollReveal(0.05);
  const actionsRef = useScrollReveal(0.05);
  const featuredRef = useScrollReveal(0.05);
  const stepsRef   = useScrollReveal(0.05);
  const trustRef   = useScrollReveal(0.05);
  const ctaRef     = useScrollReveal(0.05);

  // Fetch Featured Medicines from PostgreSQL on load
  useEffect(() => {
    fetch(`${API_BASE}/api/medicines?pageSize=8&sort=name`)
      .then(res => res.json())
      .then(data => {
        if (data.medicines && data.medicines.length > 0) {
          setFeaturedMeds(data.medicines);
        }
      })
      .catch(err => console.warn('Featured meds fetch fallback:', err.message))
      .finally(() => setLoadingFeatured(false));
  }, []);

  // Debounced Search Handler for Hero Search Bar
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API_BASE}/api/medicines?keyword=${encodeURIComponent(searchQuery)}&pageSize=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.medicines || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.warn('Hero search query failed:', err.message);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.pageWrap}>

      {/* 1. HERO SECTION WITH LIVE INSTANT SEARCH */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroContainer}>
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              
              <div className={styles.heroBadge} data-reveal="true" data-delay="0">
                <span className={styles.iconLightning}><Zap size={16} /></span>
                <span className={styles.badgeText}>ULTRA-FAST EMERGENCY HEALTHCARE</span>
              </div>

              <h1 className={styles.heroTitle} data-reveal="true" data-delay="80">
                Medicines <br />
                Delivered in <span className={styles.textHighlight}>30 Mins</span>
              </h1>

              <p className={styles.heroSubtext} data-reveal="true" data-delay="160">
                Express doorstep delivery for emergency acute meds, daily prescriptions, and temperature-controlled cold chain care. Guaranteed authentic from licensed pharmacies.
              </p>

              {/* LIVE HERO SEARCH BAR WIDGET */}
              <div className={styles.heroSearchWrap} ref={searchContainerRef} data-reveal="true" data-delay="200">
                <div className={styles.searchBarBox}>
                  <Search size={20} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search 250,000+ medicines by brand name, salt, or generic composition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                    className={styles.heroSearchInput}
                  />
                  {searchQuery && (
                    <button className={styles.searchClearBtn} onClick={() => setSearchQuery('')}>
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* SEARCH RESULTS AUTOCOMPLETE DROPDOWN */}
                {showDropdown && (
                  <div className={styles.searchDropdown}>
                    {isSearching ? (
                      <div className={styles.searchDropdownLoading}>Searching 254,000+ medicines in PostgreSQL...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((med) => (
                        <div key={med.id} className={styles.searchDropdownItem}>
                          <div className={styles.searchItemDetails}>
                            <strong>{med.brandName || med.name}</strong>
                            <small>{med.genericName || med.salt} • {med.manufacturer}</small>
                          </div>
                          <div className={styles.searchItemRight}>
                            <span className={styles.searchItemPrice}>₹{parseFloat(med.price).toFixed(2)}</span>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                addItem(med);
                                setSearchQuery('');
                                setShowDropdown(false);
                              }}
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.searchDropdownEmpty}>No medicines found matching &quot;{searchQuery}&quot;</div>
                    )}
                    <Link to={`/medicines?keyword=${encodeURIComponent(searchQuery)}`} className={styles.searchDropdownFooter} onClick={() => setShowDropdown(false)}>
                      View all results for &quot;{searchQuery}&quot; →
                    </Link>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className={styles.heroButtons} data-reveal="true" data-delay="260">
                <Link to="/medicines" className={`btn btn-primary ${styles.btnOrder}`}>
                  <ShoppingCart size={18} /> Order Medicines
                </Link>
                <Link to="/prescriptions" className={`btn btn-outline ${styles.btnUpload}`}>
                  <Folder size={18} /> Upload Prescription
                </Link>
              </div>

              {/* RATING BADGE */}
              <div className={styles.heroSocial} data-reveal="true" data-delay="320">
                <div className={styles.avatars}>
                  <div className={styles.avatar}><UserCircle2 size={24} /></div>
                  <div className={styles.avatar}>👩‍⚕️</div>
                  <div className={styles.avatar}>👨‍⚕️</div>
                </div>
                <div className={styles.ratingText}>
                  <strong>1 Lakh+ Patients Served</strong>
                  <span>Rated 4.9/5 Across 50+ Indian Cities</span>
                </div>
              </div>
            </div>

            {/* HERO GRAPHIC WITH LIVE RIDER SIMULATION */}
            <div className={styles.heroImageWrap} data-reveal="right" data-delay="100">
              <div className={styles.pharmacistCard}>
                <div className={styles.liveTrackingCard}>
                  <div className={styles.trackingHeader}>
                    <span className={styles.livePulseDot}></span>
                    <strong>LIVE DELIVERY TRACKER</strong>
                  </div>
                  <div className={styles.trackingBody}>
                    <div className={styles.riderAvatar}><Truck size={24} /></div>
                    <div className={styles.riderInfo}>
                      <strong>MediFly Express Rider</strong>
                      <span>ETA: <strong>14 Mins</strong> • Cold-Chain (4°C)</span>
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STRUCTURED DELIVERY SPEED SLA MATRIX */}
      <section className={styles.slaSection} ref={slaRef}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionTag}><Clock size={16} /> DELIVERY SPEED TIERS</span>
            <h2>How Our 30-Minute Guarantee Works</h2>
            <p>Every medical need requires a dedicated logistics priority. Here is how our delivery timeframes are structured:</p>
          </div>

          <div className={styles.slaGrid}>
            
            {/* TIER 1: 30-MIN EXPRESS */}
            <div className={`${styles.slaCard} ${styles.slaCardHighlight}`}>
              <div className={styles.slaBadge}>⚡ FLAGSHIP SPEED</div>
              <div className={styles.slaIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <Zap size={28} />
              </div>
              <h3 className={styles.slaTitle}>30-Minute Ultra Express</h3>
              <div className={styles.slaTime}>30 Mins</div>
              <p className={styles.slaDesc}>
                Dedicated for acute emergency medical needs: pain relievers, fever medicines, allergy relief, inhalers & first-aid kits.
              </p>
              <ul className={styles.slaList}>
                <li><CheckCircle2 size={16} /> Priority rider dispatch</li>
                <li><CheckCircle2 size={16} /> Instant pharmacy pick & pack</li>
                <li><CheckCircle2 size={16} /> Available 24/7 in metro cities</li>
              </ul>
            </div>

            {/* TIER 2: 1-HOUR PRIORITY */}
            <div className={styles.slaCard}>
              <div className={styles.slaIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
                <Clock size={28} />
              </div>
              <h3 className={styles.slaTitle}>1-Hour Priority Standard</h3>
              <div className={styles.slaTime}>60 Mins</div>
              <p className={styles.slaDesc}>
                Ideal for general daily prescriptions, antibiotics, and non-emergency doctor-prescribed treatments.
              </p>
              <ul className={styles.slaList}>
                <li><CheckCircle2 size={16} /> Verified licensed partner stock</li>
                <li><CheckCircle2 size={16} /> Pharmacist prescription review</li>
                <li><CheckCircle2 size={16} /> Tamper-proof security bag</li>
              </ul>
            </div>

            {/* TIER 3: COLD CHAIN EXPRESS */}
            <div className={styles.slaCard}>
              <div className={styles.slaIcon} style={{ background: '#f0f9ff', color: '#0369a1' }}>
                <Snowflake size={28} />
              </div>
              <h3 className={styles.slaTitle}>Same-Day Cold Chain</h3>
              <div className={styles.slaTime}>2–8°C Insulated</div>
              <p className={styles.slaDesc}>
                Specialized temperature-monitored transportation for insulin, vaccines, growth hormones & biological injections.
              </p>
              <ul className={styles.slaList}>
                <li><CheckCircle2 size={16} /> Real-time thermal sensors</li>
                <li><CheckCircle2 size={16} /> Ice-gel insulated packaging</li>
                <li><CheckCircle2 size={16} /> Zero temperature degradation</li>
              </ul>
            </div>

            {/* TIER 4: AUTO-REFILL SUBSCRIPTION */}
            <div className={styles.slaCard}>
              <div className={styles.slaIcon} style={{ background: '#faf5ff', color: '#7e22ce' }}>
                <RefreshCw size={28} />
              </div>
              <h3 className={styles.slaTitle}>Scheduled Auto-Refill</h3>
              <div className={styles.slaTime}>Recurring 30 Days</div>
              <p className={styles.slaDesc}>
                Never run out of chronic medications (BP, diabetes, heart care). Delivered automatically 3 days before stock ends.
              </p>
              <ul className={styles.slaList}>
                <li><CheckCircle2 size={16} /> 10% Extra Subscriber discount</li>
                <li><CheckCircle2 size={16} /> Free automated monthly refills</li>
                <li><CheckCircle2 size={16} /> Cancel or pause anytime</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 3. PATIENT QUICK-ACTION HUB */}
      <section className={styles.actionsSection} ref={actionsRef}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCentered}>
            <h2>What Would You Like to Do Today?</h2>
            <p>Select your healthcare workflow for instant assistance</p>
          </div>

          <div className={styles.actionsGrid}>
            <Link to="/medicines" className={styles.actionCard}>
              <div className={styles.actionIcon} style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Zap size={24} /></div>
              <h3>30-Min Emergency Order</h3>
              <p>Browse 250,000+ medicines with ultra-fast doorstep dispatch</p>
              <span className={styles.actionLink}>Browse Store <ArrowRight size={16} /></span>
            </Link>

            <Link to="/salt-compare" className={styles.actionCard}>
              <div className={styles.actionIcon} style={{ background: '#ecfdf5', color: '#10b981' }}><TestTubes size={24} /></div>
              <h3>Generic Salt Matcher</h3>
              <p>Save up to 70% by matching exact active chemical compositions</p>
              <span className={styles.actionLink}>Compare Salts <ArrowRight size={16} /></span>
            </Link>

            <Link to="/prescriptions" className={styles.actionCard}>
              <div className={styles.actionIcon} style={{ background: '#fff7ed', color: '#f97316' }}><Folder size={24} /></div>
              <h3>Upload Prescription</h3>
              <p>Upload a doctor Rx photo for instant pharmacist verification</p>
              <span className={styles.actionLink}>Upload Vault <ArrowRight size={16} /></span>
            </Link>

            <Link to="/subscription" className={styles.actionCard}>
              <div className={styles.actionIcon} style={{ background: '#faf5ff', color: '#a855f7' }}><RefreshCw size={24} /></div>
              <h3>Auto-Refill Plan</h3>
              <p>Set automated monthly refills for diabetes, BP & heart medicines</p>
              <span className={styles.actionLink}>Explore Auto-Refill <ArrowRight size={16} /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED FAST-MOVING MEDICINES FROM POSTGRESQL */}
      <section className={styles.featuredSection} ref={featuredRef}>
        <div className={styles.container}>
          <div className={styles.featuredHeader}>
            <div>
              <h2>Popular & Emergency Medications</h2>
              <p>Fast-moving medicines available for instant 30-minute delivery</p>
            </div>
            <Link to="/medicines" className="btn btn-outline">
              View All 250,000+ Meds →
            </Link>
          </div>

          {loadingFeatured ? (
            <div className={styles.featuredGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : featuredMeds.length > 0 ? (
            <div className={styles.featuredGrid}>
              {featuredMeds.map((med) => (
                <MedicineCard key={med.id} medicine={med} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Loading medicines catalog...</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. TRUSTED BY MEDICAL PROFESSIONALS */}
      <section className={styles.trustedBlock} ref={trustRef}>
        <div className={styles.container}>
          <div className={styles.trustedLabel}>TRUSTED BY MEDICAL PROFESSIONALS ACROSS INDIA</div>

          <div className={styles.trustedGrid}>
            {[
              { icon: <Shield size={20} />, text: 'CDSCO COMPLIANT' },
              { icon: <Award size={20} />, text: 'ISO 9001 CERTIFIED' },
              { icon: <Hospital size={20} />, text: 'LICENSED PHARMACIES' },
              { icon: <Lock size={20} />, text: '100% SECURE PAYMENTS' },
            ].map((badge, i) => (
              <div className={styles.trustBadge} key={i}>
                <span className={styles.trustBadgeIcon}>{badge.icon}</span>
                <span className={styles.trustBadgeText}>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className={styles.ctaBanner} ref={ctaRef}>
        <div className={styles.container}>
          <div className={styles.ctaBoxWrap}>
            <div className={styles.ctaBox}>
              <div className={styles.ctaIconWrap}>
                <span className={styles.ctaIcon}>+</span>
              </div>
              <h2 className={styles.ctaTitle}>
                Your Health Can't Wait.<br />
                Neither Do We.
              </h2>
              <p className={styles.ctaSubtext}>
                Get medicines delivered in 30 minutes from licensed pharmacies near you.
              </p>
              <Link to="/medicines" className={`btn btn-primary ${styles.btnPlaceOrder}`}>
                Order Medicines Now (30-Min Delivery)
              </Link>
              <p className={styles.ctaFootnote}>First delivery free • No minimum order required</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
