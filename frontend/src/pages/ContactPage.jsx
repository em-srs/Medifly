import styles from './ContactPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { MapPin } from 'lucide-react';


export default function ContactPage() {
  const headerRef = useScrollReveal(0.05);
  const formRef   = useScrollReveal();
  const hubsRef   = useScrollReveal();
  const mapRef    = useScrollReveal();

  return (
    <div className={styles.container}>
      <div ref={headerRef}>
        <div className={styles.header} data-reveal="true" data-delay="0">
          <h1 className={styles.title}>How can we help?</h1>
          <p className={styles.subtitle}>
            We're here to ensure your healthcare needs are met with speed and care.
            <br />
            Reach out to our team through any of the channels below.
          </p>
        </div>
      </div>

      <div className={styles.grid} ref={formRef}>
        {/* Left Form Section */}
        <div className={styles.formCard} data-reveal="left" data-delay="0">
          <h2 className={styles.sectionTitle}>Send us a message</h2>
          <form className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input type="text" placeholder="Priya Sharma" className={styles.input} />
              </div>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input type="email" placeholder="priya@example.com" className={styles.input} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Subject</label>
              <div className={styles.selectWrapper}>
                <select className={styles.select}>
                  <option>Order Inquiry</option>
                  <option>Partnership</option>
                  <option>Support</option>
                </select>
                <span className={styles.selectIcon}>⌄</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Message</label>
              <textarea
                placeholder="How can we help you today?"
                className={styles.textarea}
                rows={5}
              ></textarea>
            </div>

            <button type="button" className={`btn btn-primary ${styles.submitBtn}`}>
              Send Message <span className={styles.btnIcon}>➤</span>
            </button>
          </form>
        </div>

        {/* Right Info Section */}
        <div className={styles.infoCol}>
          <div className={`${styles.card} ${styles.quickContact}`} data-reveal="right" data-delay="60">
            <h3 className={styles.cardTitle}>
              <span className={styles.icon}>❓</span> Quick Contact
            </h3>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>CUSTOMER SUPPORT</span>
              <strong className={styles.infoValue}>1800-103-MFLY (Toll Free)</strong>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>PARTNERSHIP INQUIRIES</span>
              <strong className={styles.infoValue}>partners@medifly.com</strong>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>HOURS</span>
              <span className={styles.infoText}>Mon-Sun: 24/7 Priority Support</span>
            </div>
          </div>

          <div className={`${styles.card} ${styles.helpCenter}`} data-reveal="right" data-delay="160">
            <h3 className={styles.cardTitle}>Help Center</h3>
            <ul className={styles.helpLinks}>
              <li><span>Track your delivery</span><span className={styles.arrow}>›</span></li>
              <li><span>Prescription transfers</span><span className={styles.arrow}>›</span></li>
              <li><span>Billing &amp; Insurance</span><span className={styles.arrow}>›</span></li>
            </ul>
            <button className={`btn btn-secondary ${styles.faqBtn}`}>
              Visit FAQ Hub
            </button>
          </div>
        </div>
      </div>

      {/* Hubs */}
      <div className={styles.hubsSection} ref={hubsRef}>
        <h2 className={styles.hubsTitle} data-reveal="true" data-delay="0">Our Hubs</h2>
        <div className={styles.hubsGrid}>
          {[
            { cls: styles.hubMumbai,     city: 'Mumbai, Maharashtra',  role: 'National Headquarters',   addr: ['Unit 14, Oberoi Commerz II', 'Goregaon East', 'Mumbai – 400 063'], delay: '0' },
            { cls: styles.hubBengaluru,  city: 'Bengaluru, Karnataka', role: 'Tech & Engineering Hub',  addr: ['WeWork, Prestige Atlanta', '80 Feet Road, Koramangala', 'Bengaluru – 560 034'], delay: '120' },
            { cls: styles.hubDelhi,      city: 'Delhi NCR',            role: 'North India Operations', addr: ['DLF Cyber City, Tower 9A', 'Sector 25, Phase II', 'Gurugram, Haryana – 122 002'], delay: '240' },
          ].map((hub) => (
            <div className={styles.hubCard} key={hub.city} data-reveal="true" data-delay={hub.delay}>
              <div className={`${styles.hubImage} ${hub.cls}`}>
                <div className={styles.hubOverlay}>
                  <h4>{hub.city}</h4>
                  <span>{hub.role}</span>
                </div>
              </div>
              <div className={styles.hubDetails}>
                {hub.addr.map((line) => <p key={line}>{line}</p>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className={styles.mapSection} ref={mapRef} data-reveal="scale">
        <div className={styles.mapContainer}>
          <div className={styles.mapPin}>
            <span className={styles.pinIcon}><MapPin size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
          </div>
          <button className={styles.mapBtn}>Find your local MediFly hub</button>
        </div>
      </div>
    </div>
  );
}
