import { useState } from 'react';
import styles from './SubscriptionPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Info, Settings, Package, CheckCircle2, Check, AlertTriangle, IndianRupee, Pill, Calendar, Lightbulb, Trash2, X, Star, PartyPopper, Bell, Hospital } from 'lucide-react';


// ─── Static sample data ───────────────────────────────────────────────────────
const INITIAL_MEDS = [
  { id: 1, name: 'Atorvastatin 20mg',  qty: 30, unit: 'Tablets', freq: 30, icon: <Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, color: 'iconPill',  nextRefill: '2026-03-24' },
  { id: 2, name: 'Metformin 500mg ER', qty: 60, unit: 'Tablets', freq: 30, icon: <Hospital size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, color: 'iconKit',   nextRefill: '2026-03-24' },
];

const HISTORY = [
  { id: 'REF-2026-004', date: 'Mar 14, 2026', meds: ['Atorvastatin 20mg × 30', 'Metformin 500mg × 60'], amount: '₹340', status: 'Delivered' },
  { id: 'REF-2026-003', date: 'Feb 14, 2026', meds: ['Atorvastatin 20mg × 30', 'Metformin 500mg × 60'], amount: '₹340', status: 'Delivered' },
  { id: 'REF-2026-002', date: 'Jan 14, 2026', meds: ['Atorvastatin 20mg × 30'],                         amount: '₹189', status: 'Delivered' },
  { id: 'REF-2026-001', date: 'Dec 14, 2025', meds: ['Atorvastatin 20mg × 30', 'Metformin 500mg × 60'], amount: '₹340', status: 'Skipped'   },
];

const PLANS = [
  {
    id: 'monthly', name: 'Monthly', price: '₹99', period: 'per month', save: null,
    features: ['Auto refill every 30 days', 'Email reminders', 'Free delivery', 'Easy cancellation'],
    highlight: false,
  },
  {
    id: 'yearly', name: 'Yearly', price: '₹799', period: 'per year', save: 'Save ₹389',
    features: ['Auto refill every 30 days', 'SMS + Email reminders', 'Priority delivery', '20% off on medicines', 'Free health consultation'],
    highlight: true,
  },
];

const MEDICINE_SEARCH = [
  'Amlodipine 5mg', 'Aspirin 75mg', 'Clopidogrel 75mg', 'Dolo 650',
  'Lisinopril 10mg', 'Losartan 50mg', 'Omeprazole 20mg', 'Rosuvastatin 10mg',
];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`${styles.toast} ${styles['toast' + type]}`}>
      <span>{type === 'Success' ? <CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> : type === 'Warning' ? <AlertTriangle size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> : <Info size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />} {message}</span>
      <button className={styles.toastClose} onClick={onClose}><X size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={`${styles.modal} ${wide ? styles.modalWide : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}><X size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const [activeTab,      setActiveTab]      = useState('active');
  const [meds,           setMeds]           = useState(INITIAL_MEDS);
  const [currentPlan,    setCurrentPlan]    = useState('monthly');
  const [isPaused,       setIsPaused]       = useState(false);
  const [toast,          setToast]          = useState({ msg: '', type: 'Success' });

  // modal gates
  const [modal, setModal] = useState(null); // 'manage'|'pause'|'addMed'|'deleteMed'|'calendar'|'plans'|'selectPlan'|'history'|'schedule'|'notifications'|'skipRefill'

  // form state
  const [medSearch,     setMedSearch]     = useState('');
  const [medQty,        setMedQty]        = useState(30);
  const [medFreq,       setMedFreq]       = useState(30);
  const [medToDelete,   setMedToDelete]   = useState(null);
  const [medToEdit,     setMedToEdit]     = useState(null);
  const [calendarDate,  setCalendarDate]  = useState('');
  const [planPreview,   setPlanPreview]   = useState(null);
  const [notifSMS,      setNotifSMS]      = useState(true);
  const [notifEmail,    setNotifEmail]    = useState(true);
  const [notifDays,     setNotifDays]     = useState('3');
  const [scheduleDay,   setScheduleDay]   = useState('12');

  const headerRef  = useScrollReveal(0.01);
  const medsRef    = useScrollReveal(0.01);
  const plansRef   = useScrollReveal(0.01);
  const historyRef = useScrollReveal(0.01);
  const plansPageRef = useScrollReveal(0.01);

  const showToast = (msg, type = 'Success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'Success' }), 3500);
  };
  const closeModal = () => setModal(null);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleAddMed = () => {
    if (!medSearch.trim()) return;
    const newMed = {
      id: Date.now(),
      name: medSearch,
      qty: medQty,
      unit: 'Tablets',
      freq: medFreq,
      icon: <Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />,
      color: 'iconPill',
      nextRefill: '2024-12-12',
    };
    setMeds(prev => [...prev, newMed]);
    setMedSearch(''); setMedQty(30); setMedFreq(30);
    closeModal();
    showToast(`${newMed.name} added to auto-refill!`);
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
    showToast(`Next refill for ${medToEdit.name} updated!`);
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
    showToast('Next refill skipped. See you in December!', 'Info');
  };

  const openDeleteConfirm = (med) => { setMedToDelete(med); setModal('deleteMed'); };
  const openCalendar      = (med) => { setMedToEdit(med); setCalendarDate(med.nextRefill); setModal('calendar'); };
  const openPlanSelect    = (plan) => { setPlanPreview(plan); setModal('selectPlan'); };

  const activePlan = PLANS.find(p => p.id === currentPlan);

  return (
    <div className={styles.pageWrap}>
      <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'Success' })} />

      <main className={styles.main}>
        {/* Page header */}
        <div className={styles.pageHeader} ref={headerRef}>
          <div>
            <h1 className={styles.pageTitle}>Auto Refill Subscription</h1>
            <p className={styles.pageSubtitle}>Effortless healthcare. Never run out of essential medications again.</p>
          </div>
          {isPaused && (
            <div className={styles.pausedBanner}>
              ⏸️ Subscription paused &nbsp;·&nbsp;
              <button className={styles.resumeLink} onClick={() => { setIsPaused(false); showToast('Subscription resumed!'); }}>
                Resume now
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          {[['active','Active Subscriptions'],['history','Refill History'],['plans','Plans & Pricing']].map(([key, label]) => (
            <button
              key={key}
              className={`${styles.tabBtn} ${activeTab === key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: ACTIVE SUBSCRIPTIONS ─────────────────────────────────────── */}
        {activeTab === 'active' && (
          <div className={styles.grid}>
            {/* Left col */}
            <div className={styles.leftCol}>
              {/* Member card */}
              <div className={`${styles.memberCard} ${isPaused ? styles.memberCardPaused : ''}`}>
                <div className={styles.memberHeader}>
                  <div className={styles.memberInfo}>
                    <div className={styles.verifyIcon}><Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
                    <div>
                      <h2 className={styles.memberTitle}>MediFly Plus Member</h2>
                      <p className={styles.memberDate}>
                        Next Refill: <strong>Mar 24, 2026</strong>
                      </p>
                      <p className={styles.memberValid}>Valid until Oct 24, 2025 &nbsp;·&nbsp; {activePlan?.name} plan</p>
                    </div>
                  </div>
                  <span className={isPaused ? styles.badgePaused : styles.badgeActive}>
                    {isPaused ? 'PAUSED' : 'ACTIVE'}
                  </span>
                </div>
                <div className={styles.memberActions}>
                  <button className={`btn btn-primary ${styles.manageBtn}`} onClick={() => setModal('manage')}>
                    <Settings size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Manage Plan
                  </button>
                  <button className={`${styles.pauseBtn}`} onClick={() => setModal('pause')}>
                    {isPaused ? '▶️ Resume Subscription' : '⏸️ Pause Subscription'}
                  </button>
                </div>
              </div>

              {/* Medicines */}
              <div className={styles.medsSection} ref={medsRef}>
                <div className={styles.medsHeader} data-reveal="true" data-delay="0">
                  <h3 className={styles.sectionTitle}>Medicines in Auto-Refill</h3>
                  <button className={styles.addBtn} onClick={() => setModal('addMed')}>
                    + Add Medicine
                  </button>
                </div>

                {meds.length === 0 ? (
                  <div className={styles.emptyMeds}>
                    <span><Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
                    <p>No medicines added yet.</p>
                    <button className="btn btn-primary" onClick={() => setModal('addMed')}>Add your first medicine</button>
                  </div>
                ) : (
                  <div className={styles.medsList}>
                    {meds.map((med, i) => (
                      <div className={styles.medItem} key={med.id} data-reveal="true" data-delay={i * 80}>
                        <div className={`${styles.medIcon} ${styles[med.color]}`}>{med.icon}</div>
                        <div className={styles.medDetails}>
                          <h4>{med.name}</h4>
                          <p>Qty: {med.qty} {med.unit} &nbsp;·&nbsp; Every {med.freq} days</p>
                          <p className={styles.medNext}>Next refill: <strong>{med.nextRefill}</strong></p>
                        </div>
                        <div className={styles.medActions}>
                          <button
                            className={styles.iconButton}
                            title="Change refill date"
                            onClick={() => openCalendar(med)}
                          ><Calendar size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDel}`}
                            title="Remove medicine"
                            onClick={() => openDeleteConfirm(med)}
                          ><Trash2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info cards */}
              <div className={styles.infoCardsGrid}>
                <div className={styles.infoCard} data-reveal="left" data-delay="0">
                  <div className={`${styles.infoIcon} ${styles.iconClock}`}>⏰</div>
                  <div className={styles.infoContent}>
                    <h4>Monthly Scheduling</h4>
                    <p>Adjust delivery dates based on your usage cycle.</p>
                    <button className={styles.textLink} onClick={() => setModal('schedule')}>MODIFY SCHEDULE</button>
                  </div>
                </div>
                <div className={styles.infoCard} data-reveal="right" data-delay="0">
                  <div className={`${styles.infoIcon} ${styles.iconBell}`}><Bell size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
                  <div className={styles.infoContent}>
                    <h4>Refill Reminders</h4>
                    <p>Get SMS & Email alerts before each shipment.</p>
                    <button className={styles.textLink} onClick={() => setModal('notifications')}>NOTIFICATION SETTINGS</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right col */}
            <div className={styles.rightCol}>
              <div className={styles.whyBox}>
                <h3 className={styles.whyTitle}>Why Auto-Refill?</h3>
                <ul className={styles.whyList}>
                  {['Priority Prescription Verification','0 Convenience Fees on Refills','Guaranteed stock availability','Free home sample collections'].map(item => (
                    <li key={item}><span className={styles.checkIcon}><Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>{item}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.upgradeSection} ref={plansRef}>
                <h3 className={styles.sectionTitle} data-reveal="true" data-delay="0">Upgrade your Plan</h3>
                <div className={styles.plansContainer}>
                  {PLANS.map((plan, i) => (
                    <div key={plan.id} className={`${styles.planCard} ${plan.highlight ? styles.planHighlight : ''} ${currentPlan === plan.id ? styles.planCurrent : ''}`} data-reveal="scale" data-delay={i * 100}>
                      {plan.highlight && <span className={styles.badgeBest}>BEST VALUE</span>}
                      {currentPlan === plan.id && <span className={styles.badgeCurrent}>YOUR PLAN</span>}
                      <div className={styles.planInfo}>
                        <h4>{plan.name}</h4>
                        <div className={styles.planPrice}>
                          <strong>{plan.price}</strong>
                          <span>{plan.period}</span>
                          {plan.save && <em className={styles.planSave}>{plan.save}</em>}
                        </div>
                      </div>
                      <button
                        className={currentPlan === plan.id ? styles.planBtnCurrent : `btn btn-primary ${styles.planBtnPrimary}`}
                        onClick={() => currentPlan !== plan.id && openPlanSelect(plan)}
                        disabled={currentPlan === plan.id}
                      >
                        {currentPlan === plan.id ? <><Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Current Plan</> : plan.id === 'yearly' ? 'Switch to Yearly' : `Select ${plan.name}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.breakBox} data-reveal="true" data-delay="0">
                <h4>Need a break?</h4>
                <p>Skip your next refill or pause entirely — no penalties.</p>
                <button className={styles.textLinkDark} onClick={() => setModal('skipRefill')}>SKIP NEXT REFILL</button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: REFILL HISTORY ───────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className={styles.historySection} ref={historyRef}>
            <div className={styles.historyHeader} data-reveal="true" data-delay="0">
              <h3 className={styles.sectionTitle}>Refill History</h3>
              <span className={styles.historyCount}>{HISTORY.length} orders</span>
            </div>
            <div className={styles.historyList}>
              {HISTORY.map((order, i) => (
                <div className={styles.historyCard} key={order.id} data-reveal="true" data-delay={i * 80}>
                  <div className={styles.historyLeft}>
                    <div className={styles.historyIcon}><Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
                    <div>
                      <p className={styles.historyId}>{order.id}</p>
                      <p className={styles.historyDate}>{order.date}</p>
                      <ul className={styles.historyMeds}>
                        {order.meds.map(m => <li key={m}>{m}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className={styles.historyRight}>
                    <span className={`${styles.historyStatus} ${order.status === 'Delivered' ? styles.statusDelivered : styles.statusSkipped}`}>
                      {order.status === 'Delivered' ? <Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> : '⊘'} {order.status}
                    </span>
                    <p className={styles.historyAmount}>{order.amount}</p>
                    {order.status === 'Delivered' && (
                      <button className={styles.textLink} onClick={() => showToast('Invoice downloaded!')}>Download Invoice</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: PLANS & PRICING ─────────────────────────────────────────── */}
        {activeTab === 'plans' && (
          <div className={styles.plansPage} ref={plansPageRef}>
            <div className={styles.plansPageHeader} data-reveal="true" data-delay="0">
              <h2>Choose your Plan</h2>
              <p>All plans include free delivery, easy cancellation, and dedicated support.</p>
            </div>
            <div className={styles.plansPageGrid}>
              {PLANS.map((plan, i) => (
                <div key={plan.id} className={`${styles.planPageCard} ${plan.highlight ? styles.planPageHighlight : ''} ${currentPlan === plan.id ? styles.planPageCurrent : ''}`}
                  data-reveal="scale" data-delay={i * 120}>
                  {plan.highlight && <div className={styles.planPageBadge}><Star size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> BEST VALUE</div>}
                  <h3>{plan.name}</h3>
                  <div className={styles.planPagePrice}>
                    <strong>{plan.price}</strong>
                    <span>{plan.period}</span>
                  </div>
                  {plan.save && <div className={styles.planPageSave}>{plan.save}</div>}
                  <ul className={styles.planPageFeatures}>
                    {plan.features.map(f => <li key={f}><Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {f}</li>)}
                  </ul>
                  <button
                    className={currentPlan === plan.id ? styles.planPageBtnCurrent : `btn btn-primary ${styles.planPageBtn}`}
                    onClick={() => currentPlan !== plan.id && openPlanSelect(plan)}
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? <><Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Your Current Plan</> : `Select ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════════ MODALS ═══════════════════ */}

      {/* MANAGE PLAN */}
      {modal === 'manage' && (
        <Modal title="Manage Your Plan" onClose={closeModal}>
          <div className={styles.manageGrid}>
            <div className={styles.manageDetail}><span>Current Plan</span><strong>{activePlan?.name}</strong></div>
            <div className={styles.manageDetail}><span>Price</span><strong>{activePlan?.price} / {activePlan?.period}</strong></div>
            <div className={styles.manageDetail}><span>Status</span><strong className={isPaused ? styles.textWarning : styles.textSuccess}>{isPaused ? 'Paused' : 'Active'}</strong></div>
            <div className={styles.manageDetail}><span>Next Billing</span><strong>Mar 24, 2026</strong></div>
            <div className={styles.manageDetail}><span>Medicines</span><strong>{meds.length} item(s)</strong></div>
          </div>
          <hr className={styles.divider} />
          <p className={styles.manageNote}>To change your plan, go to the <strong>Plans & Pricing</strong> tab or use the plan cards on this page.</p>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={() => { closeModal(); setActiveTab('plans'); }}>
              View All Plans
            </button>
            <button className={styles.dangerLink} onClick={() => { closeModal(); showToast('Contact support to cancel subscription.', 'Info'); }}>
              Cancel Subscription
            </button>
          </div>
        </Modal>
      )}

      {/* PAUSE / RESUME */}
      {modal === 'pause' && (
        <Modal title={isPaused ? 'Resume Subscription' : 'Pause Subscription'} onClose={closeModal}>
          <div className={styles.pauseContent}>
            <div className={styles.pauseIcon}>{isPaused ? '▶️' : '⏸️'}</div>
            {isPaused ? (
              <p>Your subscription is currently paused. Resume to continue receiving automatic refills from your next cycle.</p>
            ) : (
              <>
                <p>Your subscription will be paused for <strong>30 days</strong>. No deliveries or charges will be made during this period.</p>
                <div className={styles.pauseInfo}>
                  <span><Bell size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span> You can resume anytime from this page.
                </div>
              </>
            )}
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handlePauseToggle}>
              {isPaused ? 'Yes, Resume' : 'Yes, Pause for 30 Days'}
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Go Back</button>
          </div>
        </Modal>
      )}

      {/* ADD MEDICINE */}
      {modal === 'addMed' && (
        <Modal title="Add Medicine to Auto-Refill" onClose={closeModal}>
          <div className={styles.formGroup}>
            <label>Search Medicine</label>
            <input
              className={styles.inputField}
              list="med-list"
              placeholder="Type medicine name…"
              value={medSearch}
              onChange={e => setMedSearch(e.target.value)}
            />
            <datalist id="med-list">
              {MEDICINE_SEARCH.map(m => <option key={m} value={m} />)}
            </datalist>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Quantity</label>
              <input className={styles.inputField} type="number" min={1} max={500} value={medQty} onChange={e => setMedQty(+e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Frequency (days)</label>
              <select className={styles.inputField} value={medFreq} onChange={e => setMedFreq(+e.target.value)}>
                <option value={15}>Every 15 days</option>
                <option value={30}>Every 30 days</option>
                <option value={45}>Every 45 days</option>
                <option value={60}>Every 60 days</option>
                <option value={90}>Every 90 days</option>
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleAddMed} disabled={!medSearch.trim()}>
              + Add to Auto-Refill
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* DELETE MEDICINE */}
      {modal === 'deleteMed' && medToDelete && (
        <Modal title="Remove Medicine" onClose={closeModal}>
          <div className={styles.deleteContent}>
            <div className={styles.deleteIcon}><Trash2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
            <p>Are you sure you want to remove <strong>{medToDelete.name}</strong> from auto-refill?</p>
            <p className={styles.deleteNote}>This won't cancel any pending orders.</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.dangerBtn} onClick={handleDeleteMed}>Yes, Remove</button>
            <button className={styles.cancelBtn} onClick={closeModal}>Keep it</button>
          </div>
        </Modal>
      )}

      {/* CALENDAR / CHANGE DATE */}
      {modal === 'calendar' && medToEdit && (
        <Modal title={`Reschedule: ${medToEdit.name}`} onClose={closeModal}>
          <p className={styles.calendarNote}>Current refill date: <strong>{medToEdit.nextRefill}</strong></p>
          <div className={styles.formGroup}>
            <label>Choose new refill date</label>
            <input
              className={styles.inputField}
              type="date"
              value={calendarDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setCalendarDate(e.target.value)}
            />
          </div>
          <div className={styles.calendarTips}>
            <p><Lightbulb size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Quick picks:</p>
            <div className={styles.quickDates}>
              {['2026-03-20','2026-03-25','2026-04-01','2026-04-12'].map(d => (
                <button key={d} className={`${styles.quickDate} ${calendarDate === d ? styles.quickDateActive : ''}`} onClick={() => setCalendarDate(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleCalendarSave} disabled={!calendarDate}>
              <Calendar size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Save Date
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* SELECT / SWITCH PLAN */}
      {modal === 'selectPlan' && planPreview && (
        <Modal title="Confirm Plan Change" onClose={closeModal}>
          <div className={styles.planConfirm}>
            <div className={styles.planConfirmFrom}>
              <span>Switching from</span>
              <strong>{activePlan?.name} ({activePlan?.price})</strong>
            </div>
            <div className={styles.planConfirmArrow}>→</div>
            <div className={styles.planConfirmTo}>
              <span>Switching to</span>
              <strong>{planPreview.name} ({planPreview.price})</strong>
            </div>
          </div>
          {planPreview.save && (
            <div className={styles.planSaveNote}><PartyPopper size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> You'll save <strong>{planPreview.save}</strong> with this plan!</div>
          )}
          <ul className={styles.modalFeatureList}>
            {planPreview.features.map(f => <li key={f}><Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {f}</li>)}
          </ul>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleSelectPlan}>
              Confirm & Switch
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* MODIFY SCHEDULE */}
      {modal === 'schedule' && (
        <Modal title="Modify Delivery Schedule" onClose={closeModal}>
          <p className={styles.scheduleNote}>Choose which day of each month your refill will be delivered.</p>
          <div className={styles.formGroup}>
            <label>Delivery Day of Month</label>
            <select className={styles.inputField} value={scheduleDay} onChange={e => setScheduleDay(e.target.value)}>
              {Array.from({length:28},(_,i)=>i+1).map(d => (
                <option key={d} value={d}>{d}{['st','nd','rd'][d-1]||'th'} of every month</option>
              ))}
            </select>
          </div>
          <div className={styles.schedulePreview}>
            <Calendar size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Next deliveries: <strong>{scheduleDay} Nov</strong> · <strong>{scheduleDay} Dec</strong> · <strong>{scheduleDay} Jan</strong>
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleScheduleSave}>Save Schedule</button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* NOTIFICATION SETTINGS */}
      {modal === 'notifications' && (
        <Modal title="Notification Preferences" onClose={closeModal}>
          <div className={styles.notifList}>
            <label className={styles.notifRow}>
              <div>
                <strong>SMS Reminders</strong>
                <p>Get text alerts before each refill</p>
              </div>
              <div className={`${styles.toggle} ${notifSMS ? styles.toggleOn : ''}`} onClick={() => setNotifSMS(p => !p)}>
                <span className={styles.toggleKnob} />
              </div>
            </label>
            <label className={styles.notifRow}>
              <div>
                <strong>Email Reminders</strong>
                <p>Detailed refill summary via email</p>
              </div>
              <div className={`${styles.toggle} ${notifEmail ? styles.toggleOn : ''}`} onClick={() => setNotifEmail(p => !p)}>
                <span className={styles.toggleKnob} />
              </div>
            </label>
          </div>
          <div className={styles.formGroup} style={{marginTop:'1.5rem'}}>
            <label>Remind me _ days before refill</label>
            <select className={styles.inputField} value={notifDays} onChange={e => setNotifDays(e.target.value)}>
              {['1','2','3','5','7'].map(d => <option key={d} value={d}>{d} day{d>1?'s':''} before</option>)}
            </select>
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={handleNotifSave}>Save Preferences</button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* SKIP NEXT REFILL */}
      {modal === 'skipRefill' && (
        <Modal title="Skip Next Refill" onClose={closeModal}>
          <div className={styles.pauseContent}>
            <div className={styles.pauseIcon}>⏭️</div>
            <p>Your next scheduled refill on <strong>Mar 24, 2026</strong> will be skipped. Your subscription will continue from <strong>December</strong> onwards.</p>
            <div className={styles.pauseInfo}>
              <span><IndianRupee size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span> You will not be charged for the skipped cycle.
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
