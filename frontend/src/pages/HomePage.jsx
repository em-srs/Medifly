import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Shield, Award, Lock, RefreshCw, Folder, ShoppingCart, Package, Check, Zap, Snowflake, Search, MapPin, UserCircle2, Hospital, Truck } from 'lucide-react';


export default function HomePage() {
  const heroRef    = useScrollReveal(0.05);
  const failsRef   = useScrollReveal();
  const stepsRef   = useScrollReveal();
  const healthRef  = useScrollReveal();
  const trustRef   = useScrollReveal();
  const ctaRef     = useScrollReveal();

  return (
    <div className={styles.pageWrap}>

      {/* 1. HERO SECTION */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge} data-reveal="true" data-delay="0">
                <span className={styles.iconLightning}><Zap size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
                <span className={styles.badgeText}>ULTRA-FAST DELIVERY ACROSS INDIA</span>
              </div>
              <h1 className={styles.heroTitle} data-reveal="true" data-delay="80">
                Medicines <br />
                Delivered in <span className={styles.textCyan}>1–6</span> <br />
                <span className={styles.textCyan}>Hours</span>
              </h1>
              <p className={styles.heroSubtext} data-reveal="true" data-delay="160">
                Fast, verified, and reliable healthcare at your doorstep. Professional care you can trust, exactly when you need it.
              </p>

              <div className={styles.heroButtons} data-reveal="true" data-delay="240">
                <Link to="/medicines" className={`btn btn-primary ${styles.btnOrder}`}>
                  <span className={styles.btnIcon}><ShoppingCart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span> Order Medicines
                </Link>
                <Link to="/prescriptions" className={`btn btn-outline ${styles.btnUpload}`}>
                  <span className={styles.btnIcon}><Folder size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span> Upload Prescription
                </Link>
              </div>

              <div className={styles.heroSocial} data-reveal="true" data-delay="320">
                <div className={styles.avatars}>
                  <div className={styles.avatar}><UserCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
                  <div className={styles.avatar}>👩</div>
                  <div className={styles.avatar}><UserCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />‍🦳</div>
                </div>
                <div className={styles.ratingText}>
                  <strong>1 Lakh+ Happy Patients</strong>
                  <span>Rated 4.8/5 across India</span>
                </div>
              </div>
            </div>

            <div className={styles.heroImageWrap} data-reveal="right" data-delay="100">
              <div className={styles.pharmacistImage}>
                <div className={styles.floatingCard}>
                  <div className={styles.checkIcon}><Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
                  <div className={styles.floatingText}>
                    <strong>Live Tracking</strong>
                    <span>Rider is 5 Mins away · Bandra West</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY TRADITIONAL FAILS */}
      <section className={styles.whyFails} ref={failsRef}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCentered} data-reveal="true" data-delay="0">
            <h2>Why Traditional Delivery Fails</h2>
            <p>Slow logistics can compromise your health. We solved the 3-day waiting period that puts patients at risk.</p>
          </div>

          <div className={styles.failsGrid}>
            <div className={styles.cardInfo} data-reveal="true" data-delay="0">
              <div className={`${styles.iconCircle} ${styles.iconRed}`}>
                <span className={styles.iconInside}>⏰</span>
              </div>
              <h3>2-Day Delays</h3>
              <p>Most pharmacies take 48-72 hours to deliver. For chronic conditions or acute pain, this wait is dangerous and unnecessary.</p>
            </div>

            <div className={styles.cardInfo} data-reveal="true" data-delay="120">
              <div className={`${styles.iconCircle} ${styles.iconOrange}`}>
                <span className={styles.iconInside}><Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
              </div>
              <h3>Unverified Sources</h3>
              <p>Buying online often means uncertainty about drug origin. Many platforms lack direct pharmacist supervision.</p>
            </div>

            <div className={styles.cardInfo} data-reveal="true" data-delay="240">
              <div className={`${styles.iconCircle} ${styles.iconBlue}`}>
                <span className={styles.iconInside}><Snowflake size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
              </div>
              <h3>Broken Cold Chain</h3>
              <p>Temperature-sensitive medications like insulin lose efficacy when transported in standard delivery bags.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SEAMLESS DELIVERY */}
      <section className={styles.deliverySteps} ref={stepsRef}>
        <div className={styles.container}>
          <div className={styles.stepsLayout}>
            <div className={styles.stepsLeft}>
              <h2 className={styles.sectionTitle} data-reveal="left" data-delay="0">Seamless Delivery in 4 Steps</h2>

              <div className={styles.stepperContainer}>
                {[
                  { icon: <Search size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, title: 'Search & Order',           desc: 'Select your medicines from our extensive verified catalog or simply upload your prescription photo.', active: true },
                  { icon: '📋', title: 'Pharmacist Verification',  desc: 'Our licensed pharmacists review every order for dosage accuracy and potential drug interactions.' },
                  { icon: <Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, title: 'Professional Packing',     desc: 'Medications are sealed in tamper-proof packaging. Sensitive items are placed in cold-chain storage.' },
                  { icon: <Truck size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, title: 'Rapid Last-Mile Delivery', desc: 'A dedicated MediFly rider picks up your order and delivers it to your doorstep in under 6 hours.' },
                ].map((step, i) => (
                  <div className={styles.stepItem} key={i} data-reveal="left" data-delay={i * 100}>
                    <div className={`${styles.stepNumber} ${step.active ? styles.stepActive : ''}`}>
                      <span>{step.icon}</span>
                    </div>
                    <div className={styles.stepContent}>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                    {i < 3 && <div className={step.active ? styles.lineActive : styles.lineInactive}></div>}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.stepsRight} data-reveal="right" data-delay="100">
              <div className={styles.mapPhoneContainer}>
                <div className={styles.phoneFrame}>
                  <div className={styles.phoneScreen}>
                    <div className={styles.mapHeader}>
                      <span className={styles.redDot}>•</span>
                      <strong>NEARBY PHARMACY</strong>
                    </div>
                    <div className={styles.mapGraphic}>
                      <svg viewBox="0 0 200 300" className={styles.mapSvg}>
                        <path d="M 50 0 L 50 300 M 150 0 L 150 300 M 0 100 L 200 100 M 0 200 L 200 200" stroke="#E2E8F0" strokeWidth="15"/>
                        <path d="M 50 100 L 100 180 L 150 200" stroke="#0EA5E9" fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 6"/>
                      </svg>
                      <div className={styles.mapPin}><MapPin size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
                    </div>
                  </div>
                  <div className={styles.phoneHomeBtn}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BUILT FOR BETTER HEALTH */}
      <section className={styles.betterHealth} ref={healthRef}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderCentered} data-reveal="true" data-delay="0">
            <h2>Built for Better Health</h2>
            <p>We provide more than just delivery. Our platform is designed to make managing your health effortless and affordable.</p>
          </div>

          <div className={styles.healthGrid}>
            {[
              { icon: '⏱️', title: 'Express 1-Hour',   desc: 'Urgent needs met within the hour across Mumbai, Delhi, Bengaluru, Hyderabad & Pune.' },
              { icon: <RefreshCw size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, title: 'Salt Comparison',  desc: 'Save up to 70% by comparing different brands with the same chemical composition.' },
              { icon: '🗓️', title: 'Auto-Refills',     desc: 'Never run out of chronic meds. We notify you and deliver before your stock ends.' },
              { icon: '🌡️', title: 'Active Cold Chain', desc: 'Specialized insulated boxes maintain 2-8°C for temperature-critical injections.' },
            ].map((card, i) => (
              <div className={styles.healthCard} key={i} data-reveal="scale" data-delay={i * 90}>
                <div className={styles.healthIcon}>{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRUSTED BY MEDICAL PROFESSIONALS */}
      <section className={styles.trustedBlock} ref={trustRef}>
        <div className={styles.container}>
          <div className={styles.trustedLabel} data-reveal="true" data-delay="0">TRUSTED BY MEDICAL PROFESSIONALS</div>

          <div className={styles.trustedGrid}>
            {[
              { icon: <Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, text: 'CDSCO COMPLIANT' },
              { icon: <Award size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, text: 'ISO 9001 CERTIFIED' },
              { icon: <Hospital size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, text: 'LICENSED PHARMACY' },
              { icon: <Lock size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, text: 'UPI & SECURE PAYMENTS' },
            ].map((badge, i) => (
              <div className={styles.trustBadge} key={i} data-reveal="scale" data-delay={i * 80}>
                <span className={styles.trustBadgeIcon}>{badge.icon}</span>
                <span className={styles.trustBadgeText}>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <section className={styles.ctaBanner} ref={ctaRef}>
        <div className={styles.container}>
          <div className={styles.ctaBoxWrap} data-reveal="scale" data-delay="0">
            <div className={styles.ctaBox}>
              <div className={styles.ctaIconWrap}>
                <span className={styles.ctaIcon}>+</span>
              </div>
              <h2 className={styles.ctaTitle}>
                Your Health Can't Wait.<br />
                Neither Do We.
              </h2>
              <p className={styles.ctaSubtext}>
                Join over 1 lakh families across India who trust MediFly for monthly medication and emergency health needs.
              </p>
              <Link to="/medicines" className={`btn btn-primary ${styles.btnPlaceOrder}`}>
                Place Your First Order
              </Link>
              <p className={styles.ctaFootnote}>First delivery is free • No minimum order</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
