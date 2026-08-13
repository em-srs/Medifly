import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './SubscriptionPage.module.css';
import { useAuth } from '@/context/AuthContext';
import { 
  Info, Settings, Package, CheckCircle2, Check, AlertTriangle, Pill, Calendar, 
  Trash2, X, Star, Bell, Zap, ArrowRight, 
  ShieldCheck, RefreshCw, Clock, Plus, Search, ChevronRight, Pause, Play, SkipForward, Tag, Snowflake, FileCheck
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Plus',
    price: '₹99',
    period: 'per month',
    save: null,
    features: ['30-Min Express Refill guarantee', '0 Convenience fees', 'SMS & Email reminders', 'Easy cancellation anytime'],
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Yearly VIP',
    price: '₹799',
    period: 'per year',
    save: 'Save ₹389 / yr',
    features: ['30-Min Ultra-Express Refill guarantee', '10% Extra discount on medicines', 'Zero emergency surcharges', 'Free doctor consultations'],
    highlight: true,
  },
];

// ─── Toast Notification Component ─────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`${styles.toast} ${styles['toast' + type]}`}>
      <span>
        {type === 'Success' ? <CheckCircle2 size={18} /> : type === 'Warning' ? <AlertTriangle size={18} /> : <Info size={18} />} {message}
      </span>
      <button className={styles.toastClose} onClick={onClose}><X size={16} /></button>
    </div>
  );
}

// ─── Modal Shell Component ───────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.modal} ${wide ? styles.modalWide : ''}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

// ─── Main Auto-Refill Page Component ─────────────────────────────────────────
export default function SubscriptionPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: '', type: 'Success' });

  // Modal states
  const [modal, setModal] = useState(null);
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [selectedDbMed, setSelectedDbMed] = useState(null);
  const [medQty, setMedQty] = useState(30);

  const showToast = (msg, type = 'Success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'Success' }), 3500);
  };
  const closeModal = () => setModal(null);

  // Fetch real user subscriptions from backend
  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const res = await fetch(`${API_BASE}/api/subscriptions`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(Array.isArray(data) ? data : []);
      } else {
        setSubscriptions([]);
      }
    } catch (err) {
      console.warn('Error fetching subscriptions:', err.message);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Handle pause/resume
  const handleTogglePause = async (subId, currentStatus) => {
    const newStatus = currentStatus === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/${subId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Subscription status updated to ${newStatus}`);
        fetchSubscriptions();
      } else {
        showToast('Failed to update status', 'Warning');
      }
    } catch (err) {
      showToast('Error updating status', 'Warning');
    }
  };

  // Search medicines DB for Add Medicine modal
  useEffect(() => {
    if (!medSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingDb(true);
      try {
        const res = await fetch(`${API_BASE}/api/medicines?q=${encodeURIComponent(medSearchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearchingDb(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [medSearchQuery]);

  // Handle Add Medicine to active subscription
  const handleAddMedicineSubmit = async () => {
    if (!selectedDbMed) {
      showToast('Please select a medicine', 'Warning');
      return;
    }

    const activeSub = subscriptions.find(s => s.status !== 'CANCELLED');
    if (!activeSub) {
      showToast('No active subscription found. Please subscribe to a plan first.', 'Warning');
      return;
    }

    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/${activeSub.id}/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          medicineId: selectedDbMed.id || selectedDbMed._id,
          quantity: medQty,
        }),
      });

      if (res.ok) {
        showToast(`${selectedDbMed.brandName || selectedDbMed.name} added to auto-refill!`);
        closeModal();
        fetchSubscriptions();
      } else {
        showToast('Failed to add medicine', 'Warning');
      }
    } catch (err) {
      showToast('Error adding medicine', 'Warning');
    }
  };

  // Handle Create New Subscription (if fresh account subscribes to plan)
  const handleSubscribePlan = async (planId) => {
    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const res = await fetch(`${API_BASE}/api/subscriptions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          frequency: 30,
          nextDeliveryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          deliveryAddress: user?.address || 'Default Express Address',
          medicines: [],
        }),
      });

      if (res.ok) {
        showToast(`Subscribed to MediFly ${planId === 'yearly' ? 'Yearly VIP' : 'Monthly Plus'} Plan!`);
        setActiveTab('active');
        fetchSubscriptions();
      } else {
        showToast('Failed to create subscription', 'Warning');
      }
    } catch (err) {
      showToast('Error creating subscription', 'Warning');
    }
  };

  const activeSub = subscriptions.find(s => s.status !== 'CANCELLED');
  const activeMeds = activeSub?.medicines || [];

  return (
    <div className={styles.layout}>
      <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'Success' })} />

      <div className={styles.container}>
        {/* ── 1. Hero Section ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <div className={styles.expressPillBadge}>
              <Zap size={14} /> 30-Minute Express Auto-Refill Guarantee
            </div>
            <h1 className={styles.heroTitle}>Auto-Refill Subscription</h1>
            <p className={styles.heroSubtitle}>
              Never run out of chronic medications again. Automatic priority express delivery 3 days before your stock ends.
            </p>
          </div>

          <div className={styles.heroTrackerCard}>
            <div className={styles.trackerHeader}>
              <span className={styles.trackerTitle}>Refill Cycle Tracker</span>
              <span className={styles.trackerBadge}>{activeSub ? (activeSub.status === 'PAUSED' ? 'Paused' : 'Active') : 'Standby'}</span>
            </div>
            <div className={styles.trackerDays}>
              <span className={styles.trackerBigNum}>{activeSub ? '12' : '0'}</span>
              <span className={styles.trackerSub}>Days to Next Dispatch</span>
            </div>
            <div className={styles.trackerProgress}>
              <div className={styles.trackerProgressBar} style={{ width: activeSub ? '60%' : '0%' }}></div>
            </div>
          </div>
        </section>

        {/* ── 2. Tabs Bar ── */}
        <div className={styles.tabsBar}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'active' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Subscriptions
            <span className={styles.tabCountBadge}>{activeSub ? 1 : 0}</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'plans' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            Plans & Member Perks
          </button>
        </div>

        {/* ── 3. Main Content Layout ── */}
        <div className={styles.mainLayout}>
          {/* LEFT: Main Subscription & Medicines Area */}
          <div className={styles.leftCol}>
            {activeTab === 'active' && (
              <>
                {loading ? (
                  <div className={styles.emptyStateCard}>Loading subscriptions...</div>
                ) : !activeSub ? (
                  /* ── EMPTY / NO SUBSCRIPTION STATE FOR FRESH ACCOUNTS (e.g. Tarun) ── */
                  <div className={styles.emptyStateCard}>
                    <div className={styles.emptyIconCircle}>
                      <RefreshCw size={32} />
                    </div>
                    <h3 className={styles.emptyTitle}>You're not subscribed to Auto-Refill yet</h3>
                    <p className={styles.emptyDesc}>
                      Set up automated doorstep refills for your daily & monthly medications. Get 30-minute priority delivery, 10% extra subscriber savings, and zero convenience fees.
                    </p>
                    <button className={styles.primaryBtn} onClick={() => setActiveTab('plans')}>
                      Browse Auto-Refill Plans <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  /* ── ACTIVE SUBSCRIPTION STATE ── */
                  <>
                    {/* Subscription Status Card */}
                    <div className={styles.subStatusCard}>
                      <div className={styles.subCardHeader}>
                        <div className={styles.subTitleGroup}>
                          <div className={styles.subIconCircle}>
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <h3 className={styles.subPlanName}>MediFly Monthly Plus Member</h3>
                            <p className={styles.subPlanDesc}>30-Minute Priority Express Delivery Plan</p>
                          </div>
                        </div>
                        <span className={activeSub.status === 'PAUSED' ? styles.pausedStatusChip : styles.activeStatusChip}>
                          {activeSub.status || 'ACTIVE'}
                        </span>
                      </div>

                      {/* Stat Chips */}
                      <div className={styles.statChipsRow}>
                        <div className={styles.statChip}>
                          <Calendar size={14} style={{ color: 'var(--teal-600)' }} />
                          Next Refill: <strong>{activeSub.nextDeliveryDate ? new Date(activeSub.nextDeliveryDate).toLocaleDateString() : 'Mar 24, 2026'}</strong>
                        </div>
                        <div className={styles.statChip}>
                          <Tag size={14} style={{ color: 'var(--teal-600)' }} />
                          Subscriber Savings: <strong>10% Extra Discount</strong>
                        </div>
                        <div className={styles.statChip}>
                          <Pill size={14} style={{ color: 'var(--teal-600)' }} />
                          Scheduled Meds: <strong>{activeMeds.length} Active Items</strong>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={styles.subActionsRow}>
                        <button className={styles.primaryBtn} onClick={() => showToast('Subscription settings loaded')}>
                          <Settings size={16} /> Manage Subscription
                        </button>
                        <button
                          className={styles.secondaryBtn}
                          onClick={() => handleTogglePause(activeSub.id, activeSub.status)}
                        >
                          {activeSub.status === 'PAUSED' ? <Play size={16} /> : <Pause size={16} />}
                          {activeSub.status === 'PAUSED' ? 'Resume Auto-Refill' : 'Pause Auto-Refill'}
                        </button>
                      </div>
                    </div>

                    {/* Medicines List Section */}
                    <div className={styles.medSection}>
                      <div className={styles.medSectionHeader}>
                        <div>
                          <h4 className={styles.medSectionTitle}>Medicines in Auto-Refill Schedule</h4>
                          <p className={styles.medSectionSub}>All items will be packaged and delivered in 30 minutes on refill date</p>
                        </div>
                        <button className={styles.primaryBtn} onClick={() => setModal('addMed')}>
                          <Plus size={16} /> Add Medicine
                        </button>
                      </div>

                      {activeMeds.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                          No medicines added to auto-refill schedule yet. Click <strong>Add Medicine</strong> to add your prescriptions.
                        </div>
                      ) : (
                        <div className={styles.medCardsList}>
                          {activeMeds.map((item, idx) => {
                            const med = item.medicine || item;
                            return (
                              <div key={idx} className={styles.medCard}>
                                <div className={styles.medLeft}>
                                  <div className={styles.medIconCircle}>
                                    <Pill size={22} />
                                  </div>
                                  <div>
                                    <h5 className={styles.medName}>{med.brandName || med.name || 'Medicine'}</h5>
                                    <div className={styles.medMetaRow}>
                                      <span className={styles.medMetaBadge}>Qty: {item.quantity || med.qty || 30} Tablets</span>
                                      <span>•</span>
                                      <span>Refill Every 30 Days</span>
                                      <span>•</span>
                                      <span>Next 30-Min Dispatch: <strong>{activeSub.nextDeliveryDate ? new Date(activeSub.nextDeliveryDate).toLocaleDateString() : 'Mar 24'}</strong></span>
                                    </div>
                                  </div>
                                </div>
                                <div className={styles.medRight}>
                                  <span className={styles.medPrice}>₹{med.price || 189}</span>
                                  <div className={styles.medActionBtns}>
                                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Remove medicine">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB 2: Plans & Member Perks */}
            {activeTab === 'plans' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {PLANS.map(plan => (
                  <div key={plan.id} style={{ background: 'white', borderRadius: '20px', border: plan.highlight ? '2px solid var(--teal-500)' : '1px solid var(--slate-200)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                    {plan.highlight && (
                      <span style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--teal-500)', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', textTransform: 'uppercase' }}>
                        POPULAR
                      </span>
                    )}
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>{plan.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal-700)' }}>{plan.price}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>{plan.period}</span>
                    </div>
                    {plan.save && <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>{plan.save}</span>}
                    <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {plan.features.map((feat, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                          <Check size={16} style={{ color: 'var(--teal-600)' }} /> {feat}
                        </li>
                      ))}
                    </ul>
                    <button className={styles.primaryBtn} onClick={() => handleSubscribePlan(plan.id)} style={{ width: '100%', justifyContent: 'center' }}>
                      Subscribe Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Consolidated Sidebar Widget */}
          <aside className={styles.sidebar}>
            <div className={styles.managePanel}>
              <h3 className={styles.panelTitle}>Manage Your Subscription</h3>

              <div className={styles.subSectionRow}>
                <div className={styles.subSectionIcon}>
                  <SkipForward size={18} />
                </div>
                <div className={styles.subSectionContent}>
                  <h4>Need to pause or skip?</h4>
                  <p>Skip your next refill cycle or pause anytime with zero cancellation fees.</p>
                  <button className={styles.linkAction} onClick={() => showToast('Next refill skipped!')}>
                    SKIP NEXT REFILL <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              <div className={styles.subSectionRow}>
                <div className={styles.subSectionIcon}>
                  <Calendar size={18} />
                </div>
                <div className={styles.subSectionContent}>
                  <h4>Monthly Delivery Schedule</h4>
                  <p>Choose your preferred day of the month for 30-min express delivery.</p>
                  <button className={styles.linkAction} onClick={() => showToast('Schedule updated')}>
                    MODIFY SCHEDULE <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              <div className={styles.subSectionRow}>
                <div className={styles.subSectionIcon}>
                  <Bell size={18} />
                </div>
                <div className={styles.subSectionContent}>
                  <h4>Refill Alert Notifications</h4>
                  <p>Get SMS & Email alerts 3 days prior to order creation.</p>
                  <button className={styles.linkAction} onClick={() => showToast('Notification settings saved')}>
                    NOTIFICATION SETTINGS <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── 4. "Why MediFly Auto-Refill?" Benefits Icon Grid ── */}
        <section className={styles.benefitsSection}>
          <h3 className={styles.benefitsTitle}>Why MediFly Auto-Refill?</h3>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitTile}>
              <div className={styles.benefitIcon}><Zap size={20} /></div>
              <div>
                <h5>30-Minute Priority Express Dispatch</h5>
                <p>Orders are packed & dispatched with top priority to ensure 30-min delivery on your refill day.</p>
              </div>
            </div>

            <div className={styles.benefitTile}>
              <div className={styles.benefitIcon}><Tag size={20} /></div>
              <div>
                <h5>10% Subscriber Medication Discount</h5>
                <p>Subscribers enjoy an extra 10% discount auto-applied on all recurring prescriptions.</p>
              </div>
            </div>

            <div className={styles.benefitTile}>
              <div className={styles.benefitIcon}><ShieldCheck size={20} /></div>
              <div>
                <h5>0 Convenience & Platform Fees</h5>
                <p>Zero delivery charges, zero packaging fees, and zero hidden surcharges on subscription orders.</p>
              </div>
            </div>

            <div className={styles.benefitTile}>
              <div className={styles.benefitIcon}><Snowflake size={20} /></div>
              <div>
                <h5>Free Cold Chain (2-8°C) Handling</h5>
                <p>Insulin & temperature-sensitive meds are transported with certified cold-chain gel packs.</p>
              </div>
            </div>

            <div className={styles.benefitTile}>
              <div className={styles.benefitIcon}><FileCheck size={20} /></div>
              <div>
                <h5>Automatic Doctor Rx Renewal Check</h5>
                <p>Our licensed pharmacists check and flag expiring prescriptions so you never run out of validity.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Add Medicine Modal ── */}
      {modal === 'addMed' && (
        <Modal title="Add Medicine to Auto-Refill Schedule" onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', display: 'block', marginBottom: '0.4rem' }}>
                Search Medicine DB *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Type medicine name (e.g. Atorvastatin, Metformin)..."
                  value={medSearchQuery}
                  onChange={e => setMedSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', border: '2px solid var(--slate-200)', borderRadius: '12px', fontSize: '0.9rem' }}
                />
              </div>

              {/* Live Search Results */}
              {isSearchingDb && <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '6px' }}>Searching database...</div>}
              {searchResults.length > 0 && (
                <div style={{ background: 'white', border: '1px solid var(--slate-200)', borderRadius: '12px', marginTop: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {searchResults.map(med => (
                    <div
                      key={med.id || med._id}
                      onClick={() => { setSelectedDbMed(med); setSearchResults([]); setMedSearchQuery(med.brandName || med.name); }}
                      style={{ padding: '0.65rem 0.9rem', borderBottom: '1px solid var(--slate-100)', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      <strong>{med.brandName || med.name}</strong> — ₹{med.price}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', display: 'block', marginBottom: '0.4rem' }}>
                Quantity (Tablets)
              </label>
              <input
                type="number"
                value={medQty}
                onChange={e => setMedQty(Number(e.target.value))}
                style={{ width: '100%', padding: '0.7rem 0.9rem', border: '2px solid var(--slate-200)', borderRadius: '12px', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.5rem' }}>
              <button className={styles.primaryBtn} onClick={handleAddMedicineSubmit} style={{ flex: 1, justifyContent: 'center' }}>
                Add to Auto-Refill
              </button>
              <button className={styles.secondaryBtn} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
