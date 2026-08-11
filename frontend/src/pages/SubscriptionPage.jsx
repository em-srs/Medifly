import { useState, useEffect, useRef } from 'react';
import styles from './SubscriptionPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { 
  Info, Settings, Package, CheckCircle2, Check, AlertTriangle, Pill, Calendar, 
  Lightbulb, Trash2, X, Star, PartyPopper, Bell, Hospital, Zap, ArrowRight, 
  ShieldCheck, RefreshCw, Clock, Plus, Search, ChevronRight, Download
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// ─── Initial Fallback Sample Data ─────────────────────────────────────────────
const INITIAL_MEDS = [
  { id: 1, name: 'Atorvastatin 20mg', qty: 30, unit: 'Tablets', freq: 30, price: 189, color: 'iconPill', nextRefill: '2026-03-24' },
  { id: 2, name: 'Metformin 500mg ER', qty: 60, unit: 'Tablets', freq: 30, price: 151, color: 'iconKit', nextRefill: '2026-03-24' },
];

const HISTORY = [
  { id: 'REF-2026-004', date: 'Mar 14, 2026', meds: ['Atorvastatin 20mg × 30', 'Metformin 500mg × 60'], amount: '₹340', status: 'Delivered' },
  { id: 'REF-2026-003', date: 'Feb 14, 2026', meds: ['Atorvastatin 20mg × 30', 'Metformin 500mg × 60'], amount: '₹340', status: 'Delivered' },
  { id: 'REF-2026-002', date: 'Jan 14, 2026', meds: ['Atorvastatin 20mg × 30'], amount: '₹189', status: 'Delivered' },
  { id: 'REF-2026-001', date: 'Dec 14, 2025', meds: ['Atorvastatin 20mg × 30', 'Metformin 500mg × 60'], amount: '₹340', status: 'Skipped' },
];

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
  const [activeTab, setActiveTab] = useState('active');
  const [meds, setMeds] = useState(INITIAL_MEDS);
  const [currentPlan, setCurrentPlan] = useState('monthly');
  const [isPaused, setIsPaused] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'Success' });

  // Modal control states
  const [modal, setModal] = useState(null);

  // Form & Live Search states
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [selectedDbMed, setSelectedDbMed] = useState(null);

  const [medQty, setMedQty] = useState(30);
  const [medFreq, setMedFreq] = useState(30);
  const [medToDelete, setMedToDelete] = useState(null);
  const [medToEdit, setMedToEdit] = useState(null);
  const [calendarDate, setCalendarDate] = useState('');
  const [planPreview, setPlanPreview] = useState(null);
  const [notifSMS, setNotifSMS] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifDays, setNotifDays] = useState('3');
  const [scheduleDay, setScheduleDay] = useState('24');

  // Scroll Animations
  const headerRef = useScrollReveal(0.01);
  const medsRef = useScrollReveal(0.01);
  const plansRef = useScrollReveal(0.01);
  const historyRef = useScrollReveal(0.01);
  const plansPageRef = useScrollReveal(0.01);

  const showToast = (msg, type = 'Success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'Success' }), 3500);
  };

  const closeModal = () => {
    setModal(null);
    setMedSearchQuery('');
    setSearchResults([]);
    setSelectedDbMed(null);
  };

  // Debounced Live PostgreSQL Search for Adding Medicine
  useEffect(() => {
    if (!medSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDb(true);
      try {
        const res = await fetch(`${API_BASE}/api/medicines?keyword=${encodeURIComponent(medSearchQuery)}&pageSize=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.medicines || []);
        }
      } catch (err) {
        console.warn('Medicine search failed:', err.message);
      } finally {
        setIsSearchingDb(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [medSearchQuery]);

  // Handlers
  const handleAddMed = () => {
    const nameToAdd = selectedDbMed ? (selectedDbMed.brandName || selectedDbMed.name) : medSearchQuery;
    if (!nameToAdd.trim()) return;

    const newMed = {
      id: Date.now(),
      name: nameToAdd,
      qty: medQty,
      unit: selectedDbMed?.dosageForm || 'Tablets',
      freq: medFreq,
      price: selectedDbMed ? parseFloat(selectedDbMed.price) : 180,
      color: 'iconPill',
      nextRefill: '2026-03-24',
    };

    setMeds(prev => [...prev, newMed]);
    closeModal();
    showToast(`${newMed.name} added to 30-min auto-refill plan!`);
  };

  const handleDeleteMed = () => {
    setMeds(prev => prev.filter(m => m.id !== medToDelete.id));
    closeModal();
    showToast(`${medToDelete.name} removed from auto-refill.`, 'Warning');
    setMedToDelete(null);
  };

  const handleCalendarSave = () => {
    if (!calendarDate || !medToEdit) return;
    setMeds(prev => prev.map(m => m.id === medToEdit.id ? { ...m, nextRefill: calendarDate } : m));
    closeModal();
    showToast(`Next refill for ${medToEdit.name} updated to ${calendarDate}!`);
    setMedToEdit(null);
  };

  const handlePauseToggle = () => {
    setIsPaused(p => !p);
    closeModal();
    showToast(isPaused ? 'Subscription resumed!' : 'Subscription paused for 30 days.', isPaused ? 'Success' : 'Warning');
  };

  const handleSelectPlan = () => {
    setCurrentPlan(planPreview.id);
    closeModal();
    showToast(`Switched to ${planPreview.name} plan!`);
    setPlanPreview(null);
  };

  const handleScheduleSave = () => {
    closeModal();
    showToast(`Delivery day updated to ${scheduleDay}th of every month!`);
  };

  const handleNotifSave = () => {
    closeModal();
    showToast('Notification preferences saved!');
  };

  const handleSkipRefill = () => {
    closeModal();
    showToast('Next refill skipped. Resume in April!', 'Info');
  };

  const openDeleteConfirm = (med) => { setMedToDelete(med); setModal('deleteMed'); };
  const openCalendar = (med) => { setMedToEdit(med); setCalendarDate(med.nextRefill); setModal('calendar'); };
  const openPlanSelect = (plan) => { setPlanPreview(plan); setModal('selectPlan'); };

  const activePlan = PLANS.find(p => p.id === currentPlan);

  return (
    <div className={styles.pageWrap}>
      <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'Success' })} />

      <main className={styles.main}>
        {/* PAGE HEADER WITH 30-MIN GUARANTEE BANNER */}
        <div className={styles.pageHeader} ref={headerRef}>
          <div>
            <div className={styles.badgeHeader}>
              <Zap size={14} /> 30-MINUTE EXPRESS AUTO-REFILL GUARANTEE
            </div>
            <h1 className={styles.pageTitle}>Auto-Refill Subscription</h1>
            <p className={styles.pageSubtitle}>
              Never run out of chronic medications again. Automatic 30-minute express doorstep delivery 3 days before your stock ends.
            </p>
          </div>

          {isPaused && (
            <div className={styles.pausedBanner}>
              ⏸️ Subscription is currently paused &nbsp;·&nbsp;
              <button className={styles.resumeLink} onClick={() => { setIsPaused(false); showToast('Subscription resumed!'); }}>
                Resume now
              </button>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className={styles.tabsContainer}>
          {[
            ['active', 'Active Subscriptions'],
            ['history', 'Refill History Log'],
            ['plans', 'Plans & Member Perks']
          ].map(([key, label]) => (
            <button
              key={key}
              className={`${styles.tabBtn} ${activeTab === key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: ACTIVE SUBSCRIPTIONS ─────────────────────────────────────── */}
        {activeTab === 'active' && (
          <>
            <div className={styles.grid}>
            {/* LEFT COLUMN */}
            <div className={styles.leftCol}>
              
              {/* MEMBER STATUS CARD */}
              <div className={`${styles.memberCard} ${isPaused ? styles.memberCardPaused : ''}`}>
                <div className={styles.memberHeader}>
                  <div className={styles.memberInfo}>
                    <div className={styles.verifyIcon}><ShieldCheck size={24} /></div>
                    <div>
                      <h2 className={styles.memberTitle}>MediFly {activePlan?.name} Member</h2>
                      <p className={styles.memberDate}>
                        Next Express Refill: <strong>Mar 24, 2026 (30-Min Delivery)</strong>
                      </p>
                      <p className={styles.memberValid}>10% Extra Discount • 0 Convenience Fee • {meds.length} Active Meds</p>
                    </div>
                  </div>
                  <span className={isPaused ? styles.badgePaused : styles.badgeActive}>
                    {isPaused ? 'PAUSED' : 'ACTIVE'}
                  </span>
                </div>

                <div className={styles.memberActions}>
                  <button className={`btn btn-primary ${styles.manageBtn}`} onClick={() => setModal('manage')}>
                    <Settings size={18} /> Manage Subscription
                  </button>
                  <button className={styles.pauseBtn} onClick={() => setModal('pause')}>
                    {isPaused ? '▶️ Resume Auto-Refill' : '⏸️ Pause Auto-Refill'}
                  </button>
                </div>
              </div>

              {/* MEDICINES LIST SECTION */}
              <div className={styles.medsSection} ref={medsRef}>
                <div className={styles.medsHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>Medicines in Auto-Refill Schedule</h3>
                    <p className={styles.sectionSub}>All items will be packaged and delivered in 30 minutes on refill date</p>
                  </div>
                  <button className={styles.addBtn} onClick={() => setModal('addMed')}>
                    <Plus size={16} /> Add Medicine
                  </button>
                </div>

                {meds.length === 0 ? (
                  <div className={styles.emptyMeds}>
                    <Pill size={36} className={styles.emptyIcon} />
                    <p>No medicines added to auto-refill schedule yet.</p>
                    <button className="btn btn-primary" onClick={() => setModal('addMed')}>
                      Add Your First Medicine (Search 254k+ Meds)
                    </button>
                  </div>
                ) : (
                  <div className={styles.medsList}>
                    {meds.map((med) => (
                      <div className={styles.medItem} key={med.id}>
                        <div className={styles.medIcon}><Pill size={22} /></div>
                        <div className={styles.medDetails}>
                          <h4>{med.name}</h4>
                          <p>
                            Qty: <strong>{med.qty} {med.unit}</strong> &nbsp;·&nbsp; Refill Every <strong>{med.freq} Days</strong> &nbsp;·&nbsp; Est. Price: ₹{med.price}
                          </p>
                          <p className={styles.medNext}>
                            Next 30-Min Dispatch: <strong>{med.nextRefill}</strong>
                          </p>
                        </div>
                        <div className={styles.medActions}>
                          <button
                            className={styles.iconButton}
                            title="Reschedule refill date"
                            onClick={() => openCalendar(med)}
                          >
                            <Calendar size={18} />
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDel}`}
                            title="Remove from auto-refill"
                            onClick={() => openDeleteConfirm(med)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WHY MEDIFLY PERKS BOX */}
              <div className={styles.whyBox}>
                <h3 className={styles.whyTitle}>Why MediFly Auto-Refill?</h3>
                <ul className={styles.whyList}>
                  {[
                    '⚡ 30-Minute Priority Express Dispatch',
                    '🏷️ 10% Subscriber Medication Discount',
                    '0 Convenience & Platform Fees',
                    '❄️ Free Cold Chain (2-8°C) Handling',
                    '📋 Automatic Doctor Rx Renewal Check'
                  ].map((item, idx) => (
                    <li key={idx}>
                      <span className={styles.checkIcon}><Check size={16} /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className={styles.rightCol}>
              
              {/* NEED TO PAUSE OR SKIP CARD */}
              <div className={styles.breakBox}>
                <h4>Need to pause or skip?</h4>
                <p>Skip your next refill cycle or pause anytime with zero cancellation fees.</p>
                <div className={styles.breakBoxActions}>
                  <button className={styles.textLinkDark} onClick={() => setModal('skipRefill')}>SKIP NEXT REFILL →</button>
                  <button className={styles.textLinkDark} onClick={() => setModal('pause')}>PAUSE SUBSCRIPTION →</button>
                </div>
              </div>

              {/* QUICK CONTROL CARDS */}
              <div className={styles.controlCardsStack}>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}><Clock size={20} /></div>
                  <div className={styles.infoContent}>
                    <h4>Monthly Delivery Schedule</h4>
                    <p>Choose your preferred day of the month for 30-min express delivery.</p>
                    <button className={styles.textLink} onClick={() => setModal('schedule')}>MODIFY SCHEDULE →</button>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoIcon} style={{ background: '#ecfdf5', color: '#059669' }}><Bell size={20} /></div>
                  <div className={styles.infoContent}>
                    <h4>Refill Alert Notifications</h4>
                    <p>Get SMS & Email alerts 3 days prior to order creation.</p>
                    <button className={styles.textLink} onClick={() => setModal('notifications')}>NOTIFICATION SETTINGS →</button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* FULL-WIDTH SYMMETRICAL UPGRADE PLAN ROW */}
          <div className={styles.upgradeSectionFullWidth} ref={plansRef}>
            <div className={styles.upgradeHeaderCentered}>
              <h3>Upgrade Your Membership Plan</h3>
              <p>Get 30-min express refills, priority pharmacist verification, and waived convenience fees</p>
            </div>
            
            <div className={styles.plansContainerRow}>
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`${styles.planCardRow} ${plan.highlight ? styles.planHighlight : ''} ${currentPlan === plan.id ? styles.planCurrent : ''}`}
                >
                  {plan.highlight && <span className={styles.badgeBest}>BEST VALUE</span>}
                  {currentPlan === plan.id && <span className={styles.badgeCurrent}>YOUR PLAN</span>}
                  
                  <div className={styles.planCardRowHeader}>
                    <div>
                      <h4>{plan.name}</h4>
                      <p className={styles.planCardRowSub}>{plan.save || 'Flexible monthly billing'}</p>
                    </div>
                    <div className={styles.planPriceRow}>
                      <strong>{plan.price}</strong>
                      <span>{plan.period}</span>
                    </div>
                  </div>

                  <ul className={styles.planRowFeatures}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx}><Check size={14} /> {feat}</li>
                    ))}
                  </ul>

                  <button
                    className={currentPlan === plan.id ? styles.planBtnCurrent : `btn btn-primary ${styles.planBtnPrimary}`}
                    onClick={() => currentPlan !== plan.id && openPlanSelect(plan)}
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? <><Check size={16} /> Current Plan</> : `Select ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
        )}

        {/* ── TAB 2: REFILL HISTORY LOG ─────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className={styles.historySection} ref={historyRef}>
            <div className={styles.historyHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Past Auto-Refill History</h3>
                <p className={styles.sectionSub}>All recurring deliveries dispatched in 30 minutes</p>
              </div>
              <span className={styles.historyCount}>{HISTORY.length} Delivered Cycles</span>
            </div>

            <div className={styles.historyList}>
              {HISTORY.map((order) => (
                <div className={styles.historyCard} key={order.id}>
                  <div className={styles.historyLeft}>
                    <div className={styles.historyIcon}><Package size={22} /></div>
                    <div>
                      <p className={styles.historyId}>{order.id}</p>
                      <p className={styles.historyDate}>{order.date} • Express 30-Min Delivery</p>
                      <ul className={styles.historyMeds}>
                        {order.meds.map((m, idx) => <li key={idx}>{m}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className={styles.historyRight}>
                    <span className={`${styles.historyStatus} ${order.status === 'Delivered' ? styles.statusDelivered : styles.statusSkipped}`}>
                      {order.status === 'Delivered' ? <Check size={14} /> : '⊘'} {order.status}
                    </span>
                    <p className={styles.historyAmount}>{order.amount}</p>
                    {order.status === 'Delivered' && (
                      <button className={styles.btnDownloadInvoice} onClick={() => showToast('Downloading invoice PDF...')}>
                        <Download size={14} /> Invoice
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: PLANS & MEMBER PERKS ────────────────────────────────────── */}
        {activeTab === 'plans' && (
          <div className={styles.plansPage} ref={plansPageRef}>
            <div className={styles.plansPageHeader}>
              <h2>Choose Your Auto-Refill Membership</h2>
              <p>Every plan comes with our 30-Minute Express Guarantee and automated stock reservations.</p>
            </div>

            <div className={styles.plansPageGrid}>
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`${styles.planPageCard} ${plan.highlight ? styles.planPageHighlight : ''} ${currentPlan === plan.id ? styles.planPageCurrent : ''}`}
                >
                  {plan.highlight && <div className={styles.planPageBadge}><Star size={16} /> MOST POPULAR</div>}
                  <h3>{plan.name}</h3>
                  <div className={styles.planPagePrice}>
                    <strong>{plan.price}</strong>
                    <span>{plan.period}</span>
                  </div>
                  {plan.save && <div className={styles.planPageSave}>{plan.save}</div>}
                  
                  <ul className={styles.planPageFeatures}>
                    {plan.features.map((f, idx) => (
                      <li key={idx}><Check size={16} /> {f}</li>
                    ))}
                  </ul>

                  <button
                    className={currentPlan === plan.id ? styles.planPageBtnCurrent : `btn btn-primary ${styles.planPageBtn}`}
                    onClick={() => currentPlan !== plan.id && openPlanSelect(plan)}
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? <><Check size={16} /> Your Active Plan</> : `Switch to ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════════ INTERACTIVE MODALS ═══════════════════ */}

      {/* 1. MANAGE PLAN MODAL */}
      {modal === 'manage' && (
        <Modal title="Manage Auto-Refill Subscription" onClose={closeModal}>
          <div className={styles.manageGrid}>
            <div className={styles.manageDetail}><span>Current Membership</span><strong>{activePlan?.name}</strong></div>
            <div className={styles.manageDetail}><span>Subscription Fee</span><strong>{activePlan?.price} / {activePlan?.period}</strong></div>
            <div className={styles.manageDetail}><span>Status</span><strong className={isPaused ? styles.textWarning : styles.textSuccess}>{isPaused ? 'Paused' : 'Active'}</strong></div>
            <div className={styles.manageDetail}><span>Next Refill Date</span><strong>Mar 24, 2026</strong></div>
            <div className={styles.manageDetail}><span>Active Medications</span><strong>{meds.length} item(s)</strong></div>
          </div>
          <hr className={styles.divider} />
          <p className={styles.manageNote}>You can switch plans anytime from the <strong>Plans & Member Perks</strong> tab.</p>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={() => { closeModal(); setActiveTab('plans'); }}>
              View All Member Plans
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Close</button>
          </div>
        </Modal>
      )}

      {/* 2. PAUSE / RESUME MODAL */}
      {modal === 'pause' && (
        <Modal title={isPaused ? 'Resume Auto-Refill' : 'Pause Auto-Refill Subscription'} onClose={closeModal}>
          <div className={styles.pauseContent}>
            <div className={styles.pauseIcon}>{isPaused ? '▶️' : '⏸️'}</div>
            {isPaused ? (
              <p>Your subscription is currently paused. Resume to restart automatic 30-minute deliveries from your next cycle.</p>
            ) : (
              <>
                <p>Your subscription will be paused for <strong>30 days</strong>. No deliveries or charges will occur during this time.</p>
                <div className={styles.pauseInfo}>
                  <Bell size={16} /> You can resume anytime with 1 click.
                </div>
              </>
            )}
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handlePauseToggle}>
              {isPaused ? 'Yes, Resume Now' : 'Yes, Pause for 30 Days'}
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Go Back</button>
          </div>
        </Modal>
      )}

      {/* 3. ADD MEDICINE WITH LIVE POSTGRESQL SEARCH MODAL */}
      {modal === 'addMed' && (
        <Modal title="Add Medicine to Auto-Refill Schedule" onClose={closeModal}>
          <div className={styles.formGroup}>
            <label>Search 254,000+ Medicines from PostgreSQL</label>
            <div className={styles.modalSearchBox}>
              <Search size={18} className={styles.modalSearchIcon} />
              <input
                className={styles.inputField}
                placeholder="Type medicine brand, generic composition or salt..."
                value={medSearchQuery}
                onChange={e => {
                  setMedSearchQuery(e.target.value);
                  setSelectedDbMed(null);
                }}
              />
            </div>

            {/* LIVE AUTOCOMPLETE DROPDOWN */}
            {medSearchQuery.trim() && (
              <div className={styles.modalSearchDropdown}>
                {isSearchingDb ? (
                  <div className={styles.searchItemLoading}>Querying PostgreSQL database...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((med) => (
                    <div
                      key={med.id}
                      className={`${styles.searchDbItem} ${selectedDbMed?.id === med.id ? styles.searchDbItemSelected : ''}`}
                      onClick={() => {
                        setSelectedDbMed(med);
                        setMedSearchQuery(med.brandName || med.name);
                      }}
                    >
                      <div>
                        <strong>{med.brandName || med.name}</strong>
                        <small>{med.genericName || med.salt} • ₹{parseFloat(med.price).toFixed(2)}</small>
                      </div>
                      {selectedDbMed?.id === med.id && <Check size={16} className={styles.checkSelected} />}
                    </div>
                  ))
                ) : (
                  <div className={styles.searchItemLoading}>No exact matches found. Custom name will be added.</div>
                )}
              </div>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Quantity</label>
              <input className={styles.inputField} type="number" min={1} max={500} value={medQty} onChange={e => setMedQty(+e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Refill Frequency</label>
              <select className={styles.inputField} value={medFreq} onChange={e => setMedFreq(+e.target.value)}>
                <option value={15}>Every 15 Days</option>
                <option value={30}>Every 30 Days</option>
                <option value={45}>Every 45 Days</option>
                <option value={60}>Every 60 Days</option>
                <option value={90}>Every 90 Days</option>
              </select>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleAddMed} disabled={!medSearchQuery.trim()}>
              + Add to 30-Min Auto-Refill
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* 4. DELETE MEDICINE MODAL */}
      {modal === 'deleteMed' && medToDelete && (
        <Modal title="Remove Medicine" onClose={closeModal}>
          <div className={styles.deleteContent}>
            <div className={styles.deleteIcon}><Trash2 size={24} /></div>
            <p>Are you sure you want to remove <strong>{medToDelete.name}</strong> from auto-refill?</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.dangerBtn} onClick={handleDeleteMed}>Yes, Remove</button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* 5. CALENDAR / RESCHEDULE DATE MODAL */}
      {modal === 'calendar' && medToEdit && (
        <Modal title={`Reschedule Refill: ${medToEdit.name}`} onClose={closeModal}>
          <p className={styles.calendarNote}>Current 30-min express refill date: <strong>{medToEdit.nextRefill}</strong></p>
          
          <div className={styles.formGroup}>
            <label>Choose New Refill Date</label>
            <input
              className={styles.inputField}
              type="date"
              value={calendarDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setCalendarDate(e.target.value)}
            />
          </div>

          <div className={styles.calendarTips}>
            <p><Lightbulb size={16} /> Quick Date Pickers:</p>
            <div className={styles.quickDates}>
              {['2026-03-20', '2026-03-25', '2026-04-01', '2026-04-12'].map(d => (
                <button
                  key={d}
                  className={`${styles.quickDate} ${calendarDate === d ? styles.quickDateActive : ''}`}
                  onClick={() => setCalendarDate(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleCalendarSave} disabled={!calendarDate}>
              <Calendar size={16} /> Save New Refill Date
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* 6. SELECT / SWITCH PLAN MODAL */}
      {modal === 'selectPlan' && planPreview && (
        <Modal title="Confirm Membership Upgrade" onClose={closeModal}>
          <div className={styles.planConfirm}>
            <div className={styles.planConfirmFrom}>
              <span>Current Plan</span>
              <strong>{activePlan?.name} ({activePlan?.price})</strong>
            </div>
            <div className={styles.planConfirmArrow}>→</div>
            <div className={styles.planConfirmTo}>
              <span>New Plan</span>
              <strong>{planPreview.name} ({planPreview.price})</strong>
            </div>
          </div>

          {planPreview.save && (
            <div className={styles.planSaveNote}>
              <PartyPopper size={18} /> You will save <strong>{planPreview.save}</strong> with this membership!
            </div>
          )}

          <ul className={styles.modalFeatureList}>
            {planPreview.features.map((f, idx) => <li key={idx}><Check size={16} /> {f}</li>)}
          </ul>

          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleSelectPlan}>
              Confirm & Switch
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* 7. MODIFY SCHEDULE MODAL */}
      {modal === 'schedule' && (
        <Modal title="Modify Monthly Delivery Schedule" onClose={closeModal}>
          <p className={styles.scheduleNote}>Select which day of the month your 30-min express delivery will arrive.</p>
          <div className={styles.formGroup}>
            <label>Preferred Delivery Day</label>
            <select className={styles.inputField} value={scheduleDay} onChange={e => setScheduleDay(e.target.value)}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}{['st', 'nd', 'rd'][d - 1] || 'th'} of every month</option>
              ))}
            </select>
          </div>

          <div className={styles.schedulePreview}>
            <Calendar size={16} /> Upcoming deliveries: <strong>{scheduleDay} Mar</strong> • <strong>{scheduleDay} Apr</strong> • <strong>{scheduleDay} May</strong>
          </div>

          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleScheduleSave}>Save Schedule</button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* 8. NOTIFICATION SETTINGS MODAL */}
      {modal === 'notifications' && (
        <Modal title="Refill Notification Preferences" onClose={closeModal}>
          <div className={styles.notifList}>
            <label className={styles.notifRow}>
              <div>
                <strong>SMS Alerts</strong>
                <p>Receive SMS text alerts 3 days prior to dispatch</p>
              </div>
              <div className={`${styles.toggle} ${notifSMS ? styles.toggleOn : ''}`} onClick={() => setNotifSMS(p => !p)}>
                <span className={styles.toggleKnob} />
              </div>
            </label>

            <label className={styles.notifRow}>
              <div>
                <strong>Email Summaries</strong>
                <p>Detailed item summary and invoice via email</p>
              </div>
              <div className={`${styles.toggle} ${notifEmail ? styles.toggleOn : ''}`} onClick={() => setNotifEmail(p => !p)}>
                <span className={styles.toggleKnob} />
              </div>
            </label>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
            <label>Send Alert Days Before Dispatch</label>
            <select className={styles.inputField} value={notifDays} onChange={e => setNotifDays(e.target.value)}>
              {['1', '2', '3', '5', '7'].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''} before</option>)}
            </select>
          </div>

          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleNotifSave}>Save Preferences</button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* 9. SKIP REFILL MODAL */}
      {modal === 'skipRefill' && (
        <Modal title="Skip Next Auto-Refill Cycle" onClose={closeModal}>
          <div className={styles.pauseContent}>
            <div className={styles.pauseIcon}>⏭️</div>
            <p>Your next refill on <strong>Mar 24, 2026</strong> will be skipped. Your subscription will resume automatically in <strong>April 2026</strong>.</p>
            <div className={styles.pauseInfo}>
              <CheckCircle2 size={16} /> Zero charges or penalties for skipped cycles.
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleSkipRefill}>Yes, Skip This Refill</button>
            <button className={styles.cancelBtn} onClick={closeModal}>Keep Refill</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
