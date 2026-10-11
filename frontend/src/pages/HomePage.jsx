import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import MedicineCard from '@/components/MedicineCard';
import { useCart } from '@/context/CartContext';
import { 
  Shield, Award, Lock, RefreshCw, Folder, ShoppingCart, Zap, 
  Snowflake, Search, ArrowRight, TestTubes,
  Clock, CheckCircle2, ChevronRight, ChevronDown, Star, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const CATEGORY_ITEMS = [
  {
    id: 'pain-relief',
    label: 'Personal Care',
    url: '/medicines?category=pain-relief',
    color: '#0284c7',
    bg: '#f0f9ff',
    iconType: 'lotion'
  },
  {
    id: 'supplement',
    label: 'Vitamins & Supplements',
    url: '/medicines?category=supplement',
    color: '#d97706',
    bg: '#fffbeb',
    iconType: 'vitamins'
  },
  {
    id: 'fitness',
    label: 'Fitness & Nutrition',
    url: '/medicines?category=supplement',
    color: '#dc2626',
    bg: '#fef2f2',
    iconType: 'nutrition'
  },
  {
    id: 'diabetes',
    label: 'Diabetes Care',
    url: '/medicines?category=diabetes',
    color: '#0d9488',
    bg: '#f0fdfa',
    iconType: 'diabetes'
  },
  {
    id: 'first-aid',
    label: 'First Aid',
    url: '/medicines?category=pain-relief',
    color: '#2563eb',
    bg: '#eff6ff',
    iconType: 'oximeter'
  },
  {
    id: 'ayurveda',
    label: 'Ayurveda',
    url: '/medicines?category=all',
    color: '#16a34a',
    bg: '#f0fdf4',
    iconType: 'herbal'
  },
  {
    id: 'gastro',
    label: 'Digestive & Gut Health',
    url: '/medicines?category=gastro',
    color: '#9333ea',
    bg: '#faf5ff',
    iconType: 'gut'
  }
];

export default function HomePage() {
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Hero Search Widget State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Live Featured Products State
  const [featuredMeds, setFeaturedMeds] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Scroll Reveal Animations
  const heroRef     = useScrollReveal(0.05);
  const catRef      = useScrollReveal(0.05);
  const slaRef      = useScrollReveal(0.05);
  const actionsRef  = useScrollReveal(0.05);
  const featuredRef = useScrollReveal(0.05);
  const trustRef    = useScrollReveal(0.05);
  const ctaRef      = useScrollReveal(0.05);

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

  const handleShopNow = () => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }
    if (searchQuery.trim()) {
      params.append('keyword', searchQuery.trim());
    }
    navigate(`/medicines${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleShopNow();
    }
  };

  // Render SVG product illustration for category circles
  const renderCategoryIcon = (type) => {
    switch (type) {
      case 'lotion':
        return (
          <svg viewBox="0 0 64 64" width="52" height="52" fill="none">
            <rect x="22" y="24" width="20" height="34" rx="6" fill="#38bdf8" />
            <rect x="25" y="16" width="14" height="8" rx="2" fill="#0284c7" />
            <rect x="28" y="10" width="8" height="6" rx="2" fill="#bae6fd" />
            <path d="M26 36h12M26 42h8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="32" cy="50" r="3" fill="#ffffff" opacity="0.8" />
          </svg>
        );
      case 'vitamins':
        return (
          <svg viewBox="0 0 64 64" width="52" height="52" fill="none">
            <rect x="18" y="22" width="28" height="36" rx="6" fill="#fbbf24" />
            <rect x="22" y="14" width="20" height="8" rx="3" fill="#d97706" />
            <rect x="22" y="28" width="20" height="22" rx="3" fill="#ffffff" opacity="0.9" />
            <path d="M28 39h8M32 35v8" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'nutrition':
        return (
          <svg viewBox="0 0 64 64" width="52" height="52" fill="none">
            <rect x="16" y="20" width="32" height="38" rx="5" fill="#1e293b" />
            <rect x="20" y="14" width="24" height="6" rx="2" fill="#ef4444" />
            <rect x="20" y="28" width="24" height="18" rx="2" fill="#dc2626" />
            <path d="M26 37h12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="32" cy="51" r="2.5" fill="#fbbf24" />
          </svg>
        );
      case 'diabetes':
        return (
          <svg viewBox="0 0 64 64" width="52" height="52" fill="none">
            <rect x="18" y="16" width="28" height="42" rx="8" fill="#0f766e" />
            <rect x="22" y="22" width="20" height="18" rx="4" fill="#ccfbf1" />
            <text x="32" y="34" fill="#0f766e" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">99</text>
            <circle cx="32" cy="48" r="4" fill="#14b8a6" />
          </svg>
        );
      case 'oximeter':
        return (
          <svg viewBox="0 0 64 64" width="52" height="52" fill="none">
            <rect x="20" y="16" width="24" height="42" rx="8" fill="#334155" />
            <rect x="23" y="22" width="18" height="20" rx="4" fill="#0284c7" />
            <path d="M26 32h3l2-4 3 8 2-4h3" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="32" cy="49" r="3.5" fill="#ef4444" />
          </svg>
        );
      case 'herbal':
        return (
          <svg viewBox="0 0 64 64" width="52" height="52" fill="none">
            <path d="M26 22c0-4 3-8 6-8s6 4 6 8v4h-12v-4z" fill="#15803d" />
            <rect x="18" y="26" width="28" height="32" rx="6" fill="#166534" />
            <path d="M32 34c-4 2-5 7-5 12 5 0 10-2 11-7-1-3-4-5-6-5z" fill="#86efac" />
            <path d="M30 46c2-4 4-8 5-11" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case 'gut':
      default:
        return (
          <svg viewBox="0 0 64 64" width="52" height="52" fill="none">
            <rect x="20" y="20" width="24" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="24" y="14" width="16" height="6" rx="2" fill="#9333ea" />
            <rect x="22" y="28" width="20" height="16" rx="3" fill="#e9d5ff" />
            <text x="32" y="39" fill="#7e22ce" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">PRO</text>
            <circle cx="32" cy="50" r="3" fill="#a855f7" />
          </svg>
        );
    }
  };

  return (
    <div className={styles.pageWrap}>

      {/* 1. MEDICART-INSPIRED HERO CARD CONTAINER */}
      <section className={styles.heroSection} ref={heroRef}>
        <div className={styles.heroOuterContainer}>
          
          <div className={styles.heroCard}>
            <div className={styles.heroInnerGrid}>
              
              {/* LEFT COLUMN: HEADLINE, RATING, CTAS */}
              <div className={styles.heroContentLeft}>
                
                {/* Social Proof Avatar Rating Cluster */}
                <div className={styles.ratingBadge}>
                  <div className={styles.avatarCluster}>
                    <div className={styles.avatarPill} style={{ background: '#38bdf8' }}>
                      <span className={styles.avatarEmoji}>👨‍⚕️</span>
                    </div>
                    <div className={styles.avatarPill} style={{ background: '#34d399' }}>
                      <span className={styles.avatarEmoji}>👩‍⚕️</span>
                    </div>
                    <div className={styles.avatarPill} style={{ background: '#fbbf24' }}>
                      <span className={styles.avatarEmoji}>🧑‍💼</span>
                    </div>
                  </div>
                  <div className={styles.ratingStarsWrap}>
                    <div className={styles.starRow}>
                      <Star size={14} fill="#facc15" color="#facc15" />
                      <Star size={14} fill="#facc15" color="#facc15" />
                      <Star size={14} fill="#facc15" color="#facc15" />
                      <Star size={14} fill="#facc15" color="#facc15" />
                      <Star size={14} fill="none" color="#facc15" />
                    </div>
                    <span className={styles.ratingText}>Trusted by 50,000+ families</span>
                  </div>
                </div>

                {/* Impact Headline */}
                <h1 className={styles.heroHeadline}>
                  Healthcare<br />
                  Delivered to Your<br />
                  Doorstep
                </h1>

                {/* Subtext */}
                <p className={styles.heroSubtext}>
                  Order medicines, consult doctors online, and get doorstep delivery within 30 minutes. Guaranteed authentic from licensed pharmacies.
                </p>

                {/* Dual Pill CTA Buttons */}
                <div className={styles.heroPillActions}>
                  <Link to="/medicines" className={styles.btnOrderMeds}>
                    Order Medicines
                  </Link>
                  <Link to="/prescriptions" className={styles.btnUploadRx}>
                    Upload Prescription
                  </Link>
                </div>

              </div>

              {/* RIGHT COLUMN: DELIVERY COURIER PHOTO */}
              <div className={styles.heroRiderColumn}>
                <div className={styles.riderFrame}>
                  <img 
                    src="/hero_delivery_rider.jpg" 
                    alt="MediFly Express Delivery Courier" 
                    className={styles.riderImage}
                  />
                  {/* Subtle Floating 30-min Speed Tag */}
                  <div className={styles.floatingSpeedTag}>
                    <span className={styles.speedPulseDot}></span>
                    <div>
                      <strong>30-Min Express</strong>
                      <small>Cold-Chain Verified</small>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* FLOATING "SELECT A PRODUCT" FINDER BAR (BOTTOM OF HERO) */}
            <div className={styles.finderBarWrap} ref={searchContainerRef}>
              <div className={styles.finderBar}>
                
                <span className={styles.finderLabel}>Select a product</span>

                {/* Category Dropdown */}
                <div className={styles.selectWrapper}>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.finderSelect}
                    aria-label="Filter by category"
                  >
                    <option value="all">All Categories</option>
                    <option value="pain-relief">Pain Relief & Analgesics</option>
                    <option value="antibiotic">Antibiotics</option>
                    <option value="diabetes">Diabetes Care</option>
                    <option value="cardiac">Heart & Cardiac Care</option>
                    <option value="allergy">Allergy & Antihistamines</option>
                    <option value="respiratory">Respiratory & Inhalers</option>
                    <option value="gastro">Stomach & Gut Care</option>
                    <option value="cold-flu">Cold & Flu</option>
                    <option value="supplement">Vitamins & Supplements</option>
                  </select>
                  <ChevronDown size={15} className={styles.selectChevron} />
                </div>

                {/* Brand / Form Dropdown */}
                <div className={styles.selectWrapper}>
                  <select 
                    value={selectedBrand} 
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className={styles.finderSelect}
                    aria-label="Filter by brand"
                  >
                    <option value="all">All Brands</option>
                    <option value="cipla">Cipla</option>
                    <option value="sun">Sun Pharma</option>
                    <option value="reddy">Dr. Reddy&apos;s</option>
                    <option value="abbott">Abbott</option>
                    <option value="torrent">Torrent Pharma</option>
                    <option value="mankind">Mankind Pharma</option>
                    <option value="gsk">GlaxoSmithKline</option>
                  </select>
                  <ChevronDown size={15} className={styles.selectChevron} />
                </div>

                <span className={styles.finderOr}>or</span>

                {/* SKU / Medicine Input */}
                <div className={styles.inputWrap}>
                  <Search size={16} className={styles.inputSearchIcon} />
                  <input 
                    type="text"
                    placeholder="Enter SKU or Medicine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    className={styles.finderInput}
                  />
                  {searchQuery && (
                    <button className={styles.clearBtn} onClick={() => setSearchQuery('')} aria-label="Clear input">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Shop Now Action Button */}
                <button 
                  className={styles.btnShopNow}
                  onClick={handleShopNow}
                >
                  Shop Now
                </button>

              </div>

              {/* LIVE AUTOCOMPLETE DROPDOWN */}
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
                    View all catalog results for &quot;{searchQuery}&quot; →
                  </Link>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* 2. SHOP BY CATEGORY CIRCULAR GRID */}
      <section className={styles.categorySection} ref={catRef}>
        <div className={styles.container}>
          
          <div className={styles.categorySectionHeader}>
            <h2 className={styles.categorySectionTitle}>Shop by Category</h2>
            <Link to="/medicines" className={styles.categorySeeAllLink}>
              Shop All Products <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.circularCategoryGrid}>
            {CATEGORY_ITEMS.map((cat) => (
              <Link 
                to={cat.url} 
                key={cat.id} 
                className={styles.circularCategoryCard}
              >
                <div className={styles.circleOuter} style={{ backgroundColor: cat.bg }}>
                  <div className={styles.circleGraphic}>
                    {renderCategoryIcon(cat.iconType)}
                  </div>
                </div>
                <span className={styles.categoryCardTitle}>{cat.label}</span>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 3. STRUCTURED DELIVERY SPEED SLA MATRIX */}
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

      {/* 4. PATIENT QUICK-ACTION HUB */}
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

      {/* 5. FEATURED FAST-MOVING MEDICINES FROM POSTGRESQL */}
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

      {/* 6. TRUSTED BY MEDICAL PROFESSIONALS */}
      <section className={styles.trustedBlock} ref={trustRef}>
        <div className={styles.container}>
          <div className={styles.trustedLabel}>TRUSTED BY MEDICAL PROFESSIONALS ACROSS INDIA</div>

          <div className={styles.trustedGrid}>
            {[
              { icon: <Shield size={20} />, text: 'CDSCO COMPLIANT' },
              { icon: <Award size={20} />, text: 'ISO 9001 CERTIFIED' },
              { icon: <Lock size={20} />, text: '100% SECURE PAYMENTS' },
              { icon: <CheckCircle2 size={20} />, text: 'VERIFIED PHARMACIES' },
            ].map((badge, i) => (
              <div className={styles.trustBadge} key={i}>
                <span className={styles.trustBadgeIcon}>{badge.icon}</span>
                <span className={styles.trustBadgeText}>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className={styles.ctaBanner} ref={ctaRef}>
        <div className={styles.container}>
          <div className={styles.ctaBoxWrap}>
            <div className={styles.ctaBox}>
              <div className={styles.ctaIconWrap}>
                <span className={styles.ctaIcon}>+</span>
              </div>
              <h2 className={styles.ctaTitle}>
                Your Health Can&apos;t Wait.<br />
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
