import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './AboutPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { 
  Shield, Check, Snowflake, UserCircle2, Truck, Zap, TestTubes, RefreshCw, 
  Mail, Phone, Clock, Send, Store, Bike, AlertCircle, CheckCircle2 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default function AboutPage() {
  const location = useLocation();
  const contactSectionRef = useRef(null);

  // Scroll reveal refs
  const heroRef  = useScrollReveal(0.01);
  const whyRef   = useScrollReveal(0.01);
  const diffRef  = useScrollReveal(0.01);
  const trustRef = useScrollReveal(0.01);
  const contactRef = useScrollReveal(0.01);

  // Contact Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Auto-scroll to #contact section if hash present in URL
  useEffect(() => {
    if (location.hash === '#contact' && contactSectionRef.current) {
      setTimeout(() => {
        contactSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [location.hash]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFeedback({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`${API_BASE}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ 
          type: 'success', 
          text: 'Thank you! Your message has been submitted. Our support team will get back to you shortly.' 
        });
        setForm({ name: '', email: '', category: 'General Inquiry', message: '' });
      } else {
        setFeedback({ type: 'error', text: data.message || 'Failed to submit message. Please try again.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network error submitting request. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrap}>
      <main className={styles.main}>

        {/* ── SECTION 1: ABOUT MEDIFLY ── */}
        
        {/* Hero */}
        <section className={styles.hero} ref={heroRef}>
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle} data-reveal="true" data-delay="0">
                Bridging the Healthcare<br />Logistics Gap
              </h1>
              <p className={styles.heroSub} data-reveal="true" data-delay="150">
                Medicines delivered in 30 minutes to 6 hours. Sourced from licensed brick-and-mortar pharmacies, 
                verified by clinical pharmacists, and tracked with IoT cold-chain security across India.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Statement & Key Stats */}
        <section className={styles.whySection} ref={whyRef}>
          <div className={styles.container}>
            <div className={styles.whyGrid}>
              <div className={styles.whyLeft}>
                <span className={styles.badgeLabel}>OUR MISSION</span>
                <h2 className={styles.sectionTitle} data-reveal="left" data-delay="0">
                  Why MediFly Exists
                </h2>
                <p className={styles.leadText} data-reveal="left" data-delay="100">
                  In modern healthcare, waiting 36 to 72 hours for critical medications is unacceptable. 
                  MediFly was founded to solve a vital failure in healthcare logistics by connecting patients directly 
                  with nearby licensed partner pharmacies for rapid, express fulfillment.
                </p>
                <div className={styles.quoteBox} data-reveal="left" data-delay="200">
                  <p>
                    "Our mission is to eliminate dangerous delivery delays. By combining a 254,000+ medicine 
                    database with a real-time salt matching engine and dedicated urban fleet riders, we ensure 
                    patients get their exact medications when they actually need them."
                  </p>
                </div>
              </div>

              <div className={styles.whyStats}>
                {[
                  { icon: <Zap size={22} />, stat: '30 Min', label: 'Emergency Delivery Model', delay: '0' },
                  { icon: <TestTubes size={22} />, stat: '7,500+', label: 'Verified Bioequivalent Meds', delay: '100' },
                  { icon: <Truck size={22} />, stat: '24/7', label: 'Active Dispatch Fleet', delay: '200' },
                  { icon: <Shield size={22} />, stat: '100%', label: 'Pharmacist Vetted Orders', delay: '300' },
                ].map((s) => (
                  <div className={styles.statCard} key={s.label} data-reveal="scale" data-delay={s.delay}>
                    <span className={styles.statIcon}>{s.icon}</span>
                    <h3>{s.stat}</h3>
                    <p>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What Makes MediFly Different */}
        <section className={styles.diffSection} ref={diffRef}>
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter} data-reveal="true" data-delay="0">
              <span className={styles.badgeLabel}>OUR ADVANTAGES</span>
              <h2 className={styles.sectionTitleCenter}>What Makes MediFly Different</h2>
              <p className={styles.sectionSubtitleCenter}>
                We built our platform around clinical safety, database precision, and rapid urban logistics.
              </p>
            </div>

            <div className={styles.diffGrid}>
              {[
                { 
                  icon: <Zap size={24} />, 
                  title: '30-Minute Emergency Dispatch', 
                  desc: 'Express delivery pipeline for acute prescriptions and critical healthcare supplies with real-time GPS rider tracking.', 
                  delay: '0' 
                },
                { 
                  icon: <TestTubes size={24} />, 
                  title: 'Bioequivalent Salt Engine', 
                  desc: 'Instant chemical salt comparison powered by a 254,000-row Indian pharma database to find affordable, identical active ingredients.', 
                  delay: '100' 
                },
                { 
                  icon: <Snowflake size={24} />, 
                  title: 'Certified Cold-Chain Supply', 
                  desc: 'IoT temperature-monitored carrier units ensuring temperature-sensitive medications like insulin and vaccines maintain 100% efficacy.', 
                  delay: '200' 
                },
                { 
                  icon: <Shield size={24} />, 
                  title: 'Vetted Pharmacy Network', 
                  desc: 'Every order is dispatched exclusively from accredited partner pharmacies with Drug License & GSTIN verification.', 
                  delay: '300' 
                },
              ].map((card) => (
                <div className={styles.diffCard} key={card.title} data-reveal="true" data-delay={card.delay}>
                  <div className={styles.diffIconBox}>{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Compliance */}
        <section className={styles.trustSection} ref={trustRef}>
          <div className={styles.container}>
            <div className={styles.trustGrid}>
              <div className={styles.trustContent}>
                <span className={styles.badgeLabel}>SAFETY & COMPLIANCE</span>
                <h2 className={styles.sectionTitle} data-reveal="right" data-delay="0">
                  Trust, Credibility & Pharmacist Review
                </h2>
                <p className={styles.leadText} data-reveal="right" data-delay="50">
                  Patient safety is embedded in every step of our fulfillment process.
                </p>

                <div className={styles.trustItems}>
                  {[
                    { 
                      icon: <Check size={18} />, 
                      title: 'Prescription Verification Vault', 
                      desc: 'Schedule H and H1 medications require a valid prescription upload, which is reviewed and approved by a licensed pharmacist before dispatch.', 
                      delay: '100' 
                    },
                    { 
                      icon: <Shield size={18} />, 
                      title: 'Vetted Pharmacy Partners', 
                      desc: 'We strictly onboard brick-and-mortar retail pharmacies with active State Drug Control licenses, verified GSTIN numbers, and physical audit checks.', 
                      delay: '200' 
                    },
                    { 
                      icon: <Snowflake size={18} />, 
                      title: 'Tamper-Evident Packaging', 
                      desc: 'All medicine packages are sealed with tamper-evident security labels to guarantee chain-of-custody integrity from pharmacy counter to doorstep.', 
                      delay: '300' 
                    },
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

              <div className={styles.trustVisual}>
                <div className={styles.trustCardOverlay}>
                  <Shield size={48} style={{ color: '#0ea5e9', marginBottom: '1rem' }} />
                  <h3>Pharmacist Approved</h3>
                  <p>100% Prescription Audit Guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: CONTACT & SUPPORT ── */}
        <section className={styles.contactSection} id="contact" ref={contactSectionRef}>
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter} data-reveal="true" data-delay="0">
              <span className={styles.badgeLabel}>HELP & SUPPORT</span>
              <h2 className={styles.sectionTitleCenter}>Contact MediFly Support</h2>
              <p className={styles.sectionSubtitleCenter}>
                Have a question about an order, prescription verification, or partnership? We're here to help 24/7.
              </p>
            </div>

            <div className={styles.contactGrid} ref={contactRef}>
              
              {/* Contact Form */}
              <div className={styles.formCard} data-reveal="left" data-delay="100">
                <h3>Send Us a Message</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  Fill in the details below and our patient support team will respond promptly.
                </p>

                {feedback && (
                  <div className={`${styles.alert} ${feedback.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                    {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{feedback.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="contact-name">Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="contact-email">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="rahul@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="contact-category">Inquiry Subject / Category</label>
                    <select
                      id="contact-category"
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Issue">Order / Prescription Issue</option>
                      <option value="Pharmacy Partnership">Pharmacy Partnership</option>
                      <option value="Rider Application">Fleet Rider Application</option>
                      <option value="Bug Report">Technical / Bug Report</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="contact-message">Message *</label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      placeholder="Describe your inquiry or order details..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={submitting}
                    style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                  >
                    {submitting ? 'Submitting...' : <><Send size={16} /> Submit Message</>}
                  </button>
                </form>
              </div>

              {/* Direct Contact Info & Application Cards */}
              <div className={styles.contactSidebar} data-reveal="right" data-delay="200">
                
                {/* Info Card */}
                <div className={styles.infoCard}>
                  <h3>Direct Support Lines</h3>
                  
                  <div className={styles.infoRow}>
                    <div className={styles.infoIcon}><Mail size={18} /></div>
                    <div>
                      <span className={styles.infoLabel}>Support Email</span>
                      <a href="mailto:support@medifly.com" className={styles.infoValue}>support@medifly.com</a>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.infoIcon}><Phone size={18} /></div>
                    <div>
                      <span className={styles.infoLabel}>Toll-Free Helpline</span>
                      <a href="tel:18006334359" className={styles.infoValue}>1800-MEDIFLY (24x7)</a>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.infoIcon}><Clock size={18} /></div>
                    <div>
                      <span className={styles.infoLabel}>Response Time</span>
                      <p className={styles.infoText}>
                        &lt; 15 mins for active order issues<br />
                        &lt; 2 hours for general inquiries
                      </p>
                    </div>
                  </div>
                </div>

                {/* Partner & Rider Applications Landing Box */}
                <div className={styles.applyBox}>
                  <h3>Join the MediFly Network</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    Looking to partner or join our team? Access dedicated onboarding applications below:
                  </p>

                  <div className={styles.applyLinks}>
                    <Link to="/partner/apply" className={styles.applyCard}>
                      <Store size={20} style={{ color: '#0ea5e9' }} />
                      <div>
                        <strong>Own a Pharmacy?</strong>
                        <span>Apply to partner with MediFly &gt;</span>
                      </div>
                    </Link>

                    <Link to="/rider/apply" className={styles.applyCard}>
                      <Bike size={20} style={{ color: '#0ea5e9' }} />
                      <div>
                        <strong>Want to join our fleet?</strong>
                        <span>Apply as a fleet rider &gt;</span>
                      </div>
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
