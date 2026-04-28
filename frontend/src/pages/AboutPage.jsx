import { Link } from 'react-router-dom';
import styles from './AboutPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Shield, Check, Snowflake, UserCircle2, Truck } from 'lucide-react';


export default function AboutPage() {
  const heroRef  = useScrollReveal(0.01);
  const whyRef   = useScrollReveal(0.01);
  const teamRef  = useScrollReveal(0.01);
  const trustRef = useScrollReveal(0.01);
  const ctaRef   = useScrollReveal(0.01);

  return (
    <div className={styles.pageWrap}>
      <main className={styles.main}>

        {/* Hero */}
        <section className={styles.hero} ref={heroRef}>
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle} data-reveal="true" data-delay="0">Bridging the 72-Hour<br/>Gap</h1>
              <p className={styles.heroSub} data-reveal="true" data-delay="150">
                We founded MediFly to solve a critical failure in healthcare<br/>
                logistics: the dangerous delay between prescription and<br/>
                delivery.
              </p>
            </div>
          </div>
        </section>

        {/* Why We Exist */}
        <section className={styles.whySection} ref={whyRef}>
          <div className={styles.container}>
            <div className={styles.whyGrid}>
              <div className={styles.whyLeft}>
                <h2 className={styles.sectionTitle} data-reveal="left" data-delay="0">Why We Exist</h2>
                <p className={styles.leadText} data-reveal="left" data-delay="100">
                  In the modern world, waiting 36 to 72 hours for<br/>
                  life-saving medication is unacceptable. We saw<br/>
                  patients struggling with chronic conditions and<br/>
                  acute needs, caught in the gears of outdated<br/>
                  delivery systems.
                </p>
                <div className={styles.quoteBox} data-reveal="left" data-delay="200">
                  <p>
                    "Our mission is to redefine pharmaceutical<br/>
                    logistics. By eliminating the traditional 3-day<br/>
                    waiting period, we provide a reliable, rapid-<br/>
                    response network that saves lives."
                  </p>
                </div>
              </div>

              <div className={styles.whyStats}>
                {[
                  { icon: '⏱️', stat: '90 Min', label: 'Average Delivery Time', delay: '0' },
                  { icon: <Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />,  stat: '100%',   label: 'Compliance Rate',        delay: '100' },
                  { icon: <Truck size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, stat: '24/7',   label: 'Dispatch Operations',    delay: '200' },
                  { icon: <Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, stat: 'Secure', label: 'Chain of Custody',       delay: '300' },
                ].map((s) => (
                  <div className={styles.statCard} key={s.stat} data-reveal="scale" data-delay={s.delay}>
                    <span className={styles.statIcon}>{s.icon}</span>
                    <h3>{s.stat}</h3>
                    <p>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className={styles.teamSection} ref={teamRef}>
          <div className={styles.container}>
            <div className={styles.teamHeader} data-reveal="true" data-delay="0">
              <h2 className={styles.sectionTitleCenter}>The Minds Behind the Medicine</h2>
              <p className={styles.sectionSubtitleCenter}>
                Our multidisciplinary team combines clinical expertise with cutting-edge technology and<br/>
                robust logistics to ensure your safety.
              </p>
            </div>

            <div className={styles.teamGrid}>
              {[
                { icon: <><UserCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />‍⚕️</>, title: 'Licensed Pharmacists', desc: 'Every order is vetted by our clinical team. They oversee prescription validation and provide real-time consultations for complex therapies.', delay: '0' },
                { icon: '💻',  title: 'Tech Engineers',        desc: 'Our software team builds the invisible infrastructure that routes medications through the fastest possible secure channels.', delay: '120' },
                { icon: <Truck size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />,  title: 'Logistics Experts',     desc: 'Specialists in cold-chain management and rapid urban transit, ensuring medications are handled with absolute care.', delay: '240' },
              ].map((card) => (
                <div className={styles.teamCard} key={card.title} data-reveal="true" data-delay={card.delay}>
                  <div className={styles.teamIconBox}>{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className={styles.trustSection} ref={trustRef}>
          <div className={styles.container}>
            <div className={styles.trustGrid}>
              <div className={styles.trustImage} data-reveal="left" data-delay="0"></div>
              <div className={styles.trustContent}>
                <h2 className={styles.sectionTitle} data-reveal="right" data-delay="0">Trust & Compliance</h2>

                <div className={styles.trustItems}>
                  {[
                    { icon: <Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />,   title: 'Licensed Partner Pharmacies', desc: 'We exclusively partner with accredited brick-and-mortar pharmacies, ensuring every pill comes from a trusted, legal source.', delay: '100' },
                    { icon: <Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, title: 'Schedule H Drug Safety',       desc: 'Our protocol for controlled substances exceeds federal requirements, with dual-factor verification and tamper-evident packaging.', delay: '200' },
                    { icon: <Snowflake size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />,  title: 'Cold-Chain Excellence',        desc: 'Temperature-sensitive medications like insulin are transported in IoT-monitored containers to maintain efficacy.', delay: '300' },
                  ].map((item) => (
                    <div className={styles.trustItem} key={item.title} data-reveal="right" data-delay={item.delay}>
                      <div className={styles.trustIcon}>{item.icon}</div>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection} ref={ctaRef}>
          <div className={styles.container}>
            <div className={styles.ctaBox} data-reveal="scale" data-delay="0">
              <h2>Ready to close the gap?</h2>
              <p>Experience the future of pharmaceutical logistics today. Get your<br/>medications delivered when you actually need them.</p>
              <div className={styles.ctaBtns}>
                <Link to="/medicines" className={`btn ${styles.btnDark}`}>Order Now</Link>
                <Link to="/contact"   className={`btn ${styles.btnOutlineTeal}`}>Partner With Us</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
