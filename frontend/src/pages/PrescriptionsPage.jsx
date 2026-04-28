import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import styles from './PrescriptionsPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { Shield, User, Eye, FileText, Home, ShoppingBag, Folder, Info, Settings, CheckCircle2, Check, AlertTriangle, Pill, Calendar, Search, Trash2, X, UserCircle2 } from 'lucide-react';


// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_PATIENTS = [
  {
    id: 1,
    name: 'Arjun Mehta',
    relation: 'Self',
    dob: '1990-05-14',
    bloodGroup: 'B+',
    avatar: <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />,
    prescriptions: [
      { id: 101, title: 'Cardiology Rx – Apollo', doctor: 'Dr. Sunita Rao', spec: 'Cardiologist, Apollo Hospital', date: '2026-02-18', status: 'VERIFIED', meds: 3, notes: '' },
      { id: 102, title: 'General Checkup', doctor: 'Dr. Ramesh Gupta', spec: 'General Physician', date: '2026-03-03', status: 'PENDING', meds: null, notes: 'Under review by pharmacist' },
    ],
  },
  {
    id: 2,
    name: 'Priya Mehta',
    relation: 'Spouse',
    dob: '1993-08-22',
    bloodGroup: 'O+',
    avatar: '👩',
    prescriptions: [
      { id: 201, title: 'Dermatology Rx – Skin Clinic', doctor: 'Dr. Kavitha Nair', spec: 'Dermatologist, Fortis Hospital', date: '2026-02-09', status: 'REJECTED', meds: null, notes: 'Prescription expired or stamp missing' },
    ],
  },
  {
    id: 3,
    name: 'Suresh Mehta',
    relation: 'Father',
    dob: '1958-03-10',
    bloodGroup: 'A+',
    avatar: '👴',
    prescriptions: [
      { id: 301, title: 'Orthopaedic Rx – Nanavati', doctor: 'Dr. Anil Joshi', spec: 'Orthopaedic Surgeon, Nanavati Hospital', date: '2026-02-22', status: 'VERIFIED', meds: 2, notes: '' },
      { id: 302, title: 'Neurology Follow-up', doctor: 'Dr. Priya Krishnan', spec: 'Neurologist, Hinduja Hospital', date: '2026-03-07', status: 'VERIFIED', meds: 1, notes: 'Repeat prescription approved' },
    ],
  },
];

const RELATIONS = ['Self', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Sibling', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const RELATION_AVATARS = { Self:<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, Spouse:'👩', Father:'👴', Mother:'👵', Son:<UserCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, Daughter:<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, Sibling:'🧒', Other:<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusMeta(status) {
  if (status === 'VERIFIED') return { bg: styles.bgGreen,  txt: styles.textGreen,  badge: styles.badgeGreen,  icon: <Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> };
  if (status === 'PENDING')  return { bg: styles.bgYellow, txt: styles.textYellow, badge: styles.badgeYellow, icon: '⏳' };
  return                            { bg: styles.bgRed,    txt: styles.textRed,    badge: styles.badgeRed,    icon: '!' };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  return (
    <div className={`${styles.toast} ${styles['toast' + type]}`}>
      <span>{type === 'success' ? <CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> : type === 'warn' ? <AlertTriangle size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> : <Info size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />} {msg}</span>
      <button className={styles.toastClose} onClick={onClose}><X size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.modal} ${wide ? styles.modalWide : ''}`} onClick={e => e.stopPropagation()}>
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
export default function PrescriptionsPage() {
  const pathname = useLocation().pathname;
  const fileRef  = useRef(null);

  const headerRef = useScrollReveal(0.05);
  const rxGridRef = useScrollReveal(0.08);

  const [patients,         setPatients]         = useState(SEED_PATIENTS);
  const [selectedId,       setSelectedId]       = useState(1);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [activeTab,        setActiveTab]        = useState('active');   // 'active'|'archived'
  const [toast,            setToast]            = useState({ msg:'', type:'success' });
  const [modal,            setModal]            = useState(null);       // 'addPatient'|'editPatient'|'deletePatient'|'uploadRx'|'viewRx'|'deleteRx'

  // form state — patient
  const [pForm,   setPForm]   = useState({ name:'', relation:'Self', dob:'', bloodGroup:'A+' });
  const [editPId, setEditPId] = useState(null);

  // delete confirm
  const [delPatient, setDelPatient] = useState(null);
  const [delRx,      setDelRx]      = useState(null);

  // view rx
  const [viewRx, setViewRx] = useState(null);

  // upload form
  const [rxTitle,  setRxTitle]  = useState('');
  const [rxDoctor, setRxDoctor] = useState('');
  const [rxSpec,   setRxSpec]   = useState('');
  const [rxFile,   setRxFile]   = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:'', type:'success' }), 3500);
  };
  const closeModal = () => setModal(null);

  // derived
  const selectedPatient = patients.find(p => p.id === selectedId) || patients[0];
  const isArchived = (rx) => rx.status === 'VERIFIED' && new Date(rx.date) < new Date(Date.now() - 180 * 86400000);
  const shownRxs = (selectedPatient?.prescriptions || []).filter(rx => {
    const arch = isArchived(rx);
    const match = rx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  rx.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    return (activeTab === 'archived' ? arch : !arch) && match;
  });

  // ── Patient handlers ────────────────────────────────────────────────────────
  const openAddPatient = () => {
    setPForm({ name:'', relation:'Self', dob:'', bloodGroup:'A+' });
    setEditPId(null);
    setModal('addPatient');
  };
  const openEditPatient = (p) => {
    setPForm({ name: p.name, relation: p.relation, dob: p.dob, bloodGroup: p.bloodGroup });
    setEditPId(p.id);
    setModal('addPatient');
  };
  const savePatient = () => {
    if (!pForm.name.trim()) return;
    if (editPId) {
      setPatients(prev => prev.map(p => p.id === editPId
        ? { ...p, ...pForm, avatar: RELATION_AVATARS[pForm.relation] || <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> }
        : p));
      showToast(`${pForm.name} updated!`);
    } else {
      const np = { id: Date.now(), ...pForm, avatar: RELATION_AVATARS[pForm.relation] || <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, prescriptions: [] };
      setPatients(prev => [...prev, np]);
      setSelectedId(np.id);
      showToast(`${pForm.name} added as a patient!`);
    }
    closeModal();
  };
  const confirmDeletePatient = (p) => { setDelPatient(p); setModal('deletePatient'); };
  const executeDeletePatient = () => {
    setPatients(prev => prev.filter(p => p.id !== delPatient.id));
    if (selectedId === delPatient.id && patients.length > 1) {
      setSelectedId(patients.find(p => p.id !== delPatient.id)?.id);
    }
    showToast(`${delPatient.name} removed.`, 'warn');
    setDelPatient(null); closeModal();
  };

  // ── Prescription handlers ───────────────────────────────────────────────────
  const openUpload = () => { setRxTitle(''); setRxDoctor(''); setRxSpec(''); setRxFile(null); setModal('uploadRx'); };
  const handleFileChange = (e) => { if (e.target.files[0]) setRxFile(e.target.files[0]); };
  const saveRx = () => {
    if (!rxTitle.trim()) return;
    const newRx = {
      id: Date.now(),
      title: rxTitle || rxFile?.name || 'New Prescription',
      doctor: rxDoctor || 'Unknown Doctor',
      spec: rxSpec || 'General',
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      meds: null,
      notes: 'Under review by pharmacist',
    };
    setPatients(prev => prev.map(p => p.id === selectedId
      ? { ...p, prescriptions: [newRx, ...p.prescriptions] }
      : p));
    closeModal();
    showToast(`Prescription uploaded for ${selectedPatient.name}!`);
  };
  const openViewRx = (rx) => { setViewRx(rx); setModal('viewRx'); };
  const confirmDeleteRx = (rx) => { setDelRx(rx); setModal('deleteRx'); };
  const executeDeleteRx = () => {
    setPatients(prev => prev.map(p => p.id === selectedId
      ? { ...p, prescriptions: p.prescriptions.filter(r => r.id !== delRx.id) }
      : p));
    showToast(`Prescription removed.`, 'warn');
    setDelRx(null); closeModal();
  };
  const reupload = (rx) => {
    setRxTitle(rx.title); setRxDoctor(rx.doctor); setRxSpec(rx.spec); setRxFile(null);
    setModal('uploadRx');
  };

  return (
    <div className={styles.layout}>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg:'', type:'success' })} />

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <h2 style={{ fontSize:'1.2rem', color:'var(--slate-800)', margin:'0' }}>Dashboard</h2>
        </div>
        <nav className={styles.sidebarNav}>
          {[['/', <Home size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, 'Home'], ['/prescriptions',<Folder size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />,'Vault'], ['/orders',<ShoppingBag size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />,'Orders'], ['/profile',<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />,'Profile'], ['/settings',<Settings size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />,'Settings']].map(([href, icon, label]) => (
            <Link key={href} to={href} className={`${styles.navItem} ${pathname === href ? styles.navActive : ''}`}>
              <span className={styles.navIcon}>{icon}</span>{label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        {/* Top header */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerShieldIcon}><Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
            <h2>Prescription Vault</h2>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}><Search size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
              <input
                type="text"
                placeholder="Search prescriptions…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Two-panel content */}
        <div className={styles.panels}>

          {/* ── LEFT: Patient list ── */}
          <div className={styles.patientPanel}>
            <div className={styles.patientPanelHeader}>
              <h3 className={styles.panelTitle}>Patients</h3>
              <button className={styles.addPatientBtn} onClick={openAddPatient} title="Add patient">+</button>
            </div>

            <div className={styles.patientList}>
              {patients.map(p => (
                <div
                  key={p.id}
                  className={`${styles.patientItem} ${selectedId === p.id ? styles.patientItemActive : ''}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div className={styles.patientAvatar}>{p.avatar}</div>
                  <div className={styles.patientMeta}>
                    <span className={styles.patientName}>{p.name}</span>
                    <span className={styles.patientRelation}>{p.relation}</span>
                    <span className={styles.patientRxCount}>{p.prescriptions.length} prescription{p.prescriptions.length !== 1 ? 's' : ''}</span>
                  </div>
                  {selectedId === p.id ? (
                    <div className={styles.patientActions}>
                      <button className={styles.pActionBtn} onClick={e => { e.stopPropagation(); openEditPatient(p); }} title="Edit">✏️</button>
                      <button className={styles.pActionBtn} onClick={e => { e.stopPropagation(); confirmDeletePatient(p); }} title="Remove"><Trash2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
                    </div>
                  ) : (
                    <span className={styles.patientArrow}>›</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Prescriptions for selected patient ── */}
          <div className={styles.rxPanel}>
            {/* Panel header */}
            <div className={styles.rxPanelHeader} ref={headerRef}>
              <div>
                <div className={styles.rxPatientLabel} data-reveal="true" data-delay="0">
                  <span className={styles.rxPatientAvatar}>{selectedPatient?.avatar}</span>
                  <div>
                    <h1 className={styles.pageTitle}>{selectedPatient?.name}</h1>
                    <p className={styles.pageSubtitle}>
                      {selectedPatient?.relation} &nbsp;·&nbsp;
                      DOB: {selectedPatient?.dob || '—'} &nbsp;·&nbsp;
                      Blood: <strong>{selectedPatient?.bloodGroup || '—'}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <button className={`btn btn-primary ${styles.uploadBtn}`} onClick={openUpload}>
                <span>⬆️</span> Upload Prescription
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              {[['active', 'Active Prescriptions'], ['archived', 'Archived']].map(([key, label]) => (
                <button
                  key={key}
                  className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Prescription grid */}
            {shownRxs.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <h3>No prescriptions yet</h3>
                <p>{activeTab === 'archived' ? 'No archived prescriptions for this patient.' : `Upload ${selectedPatient?.name}'s first prescription to get started.`}</p>
                {activeTab === 'active' && (
                  <button className="btn btn-primary" onClick={openUpload}>⬆️ Upload Prescription</button>
                )}
              </div>
            ) : (
              <div className={styles.grid} ref={rxGridRef}>
              {shownRxs.map((rx, i) => {
                  const sm = statusMeta(rx.status);
                  return (
                    <div key={rx.id} className={styles.card} data-reveal="true" data-delay={i * 80}>
                      <div className={styles.cardHeader}>
                        <div className={`${styles.statusIcon} ${sm.bg}`}>
                          <span className={sm.txt}>{sm.icon}</span>
                        </div>
                        <span className={`${styles.badge} ${sm.badge}`}>{rx.status}</span>
                      </div>
                      <div className={styles.cardBody}>
                        <h3>{rx.title}</h3>
                        <p>{rx.spec}</p>
                        <div className={styles.metaInfo}>
                          <p><span><UserCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />‍⚕️</span>{rx.doctor}</p>
                          <p><span><Calendar size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>Issued: {rx.date}</p>
                          {rx.meds  && <p><span><Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>{rx.meds} medicine{rx.meds > 1 ? 's' : ''} prescribed</p>}
                          {rx.notes && <p className={rx.status === 'REJECTED' ? styles.errorText : ''}><span><FileText size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>{rx.notes}</p>}
                        </div>
                      </div>
                      <div className={styles.cardFooter}>
                        {rx.status === 'VERIFIED' && (
                          <Link to="/medicines" className={`btn btn-primary ${styles.actionBtn}`}>Order Now</Link>
                        )}
                        {rx.status === 'PENDING' && (
                          <button className={`btn ${styles.disabledBtn} ${styles.actionBtn}`} disabled>Awaiting Verification</button>
                        )}
                        {rx.status === 'REJECTED' && (
                          <button className={`btn ${styles.borderBtn} ${styles.actionBtn}`} onClick={() => reupload(rx)}>Re-upload</button>
                        )}
                        <button className={styles.iconActionBtn} title="View details" onClick={() => openViewRx(rx)}><Eye size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
                        <button className={`${styles.iconActionBtn} ${styles.iconDelBtn}`} title="Delete" onClick={() => confirmDeleteRx(rx)}><Trash2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Archive hint */}
            {activeTab === 'active' && selectedPatient?.prescriptions?.length > 0 && (
              <div className={styles.archiveHint}>
                <span><Folder size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
                <p>Prescriptions older than 6 months are auto-archived. <button className={styles.textBtn} onClick={() => setActiveTab('archived')}>View archived →</button></p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ═══════════ MODALS ═══════════ */}

      {/* ADD / EDIT PATIENT */}
      {modal === 'addPatient' && (
        <Modal title={editPId ? 'Edit Patient' : 'Add New Patient'} onClose={closeModal}>
          <div className={styles.formGroup}>
            <label>Full Name *</label>
            <input className={styles.inputField} placeholder="e.g. Rahul Sharma" value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Relation</label>
              <select className={styles.inputField} value={pForm.relation} onChange={e => setPForm(f => ({ ...f, relation: e.target.value }))}>
                {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Blood Group</label>
              <select className={styles.inputField} value={pForm.bloodGroup} onChange={e => setPForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Date of Birth</label>
            <input className={styles.inputField} type="date" value={pForm.dob} onChange={e => setPForm(f => ({ ...f, dob: e.target.value }))} />
          </div>
          <div className={styles.previewAvatar}>
            <span>{RELATION_AVATARS[pForm.relation] || <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />}</span>
            <span>{pForm.name || 'Patient Name'}</span>
            <em>{pForm.relation}</em>
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={savePatient} disabled={!pForm.name.trim()}>
              {editPId ? 'Save Changes' : '+ Add Patient'}
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* DELETE PATIENT */}
      {modal === 'deletePatient' && delPatient && (
        <Modal title="Remove Patient" onClose={closeModal}>
          <div className={styles.deleteContent}>
            <div className={styles.deleteIcon}>{delPatient.avatar}</div>
            <p>Remove <strong>{delPatient.name}</strong> ({delPatient.relation}) and all their <strong>{delPatient.prescriptions.length}</strong> prescription{delPatient.prescriptions.length !== 1 ? 's' : ''}?</p>
            <p className={styles.deleteNote}>This action cannot be undone.</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.dangerBtn} onClick={executeDeletePatient}>Yes, Remove Patient</button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* UPLOAD PRESCRIPTION */}
      {modal === 'uploadRx' && (
        <Modal title={`Upload Prescription — ${selectedPatient?.name}`} onClose={closeModal}>
          <div className={styles.formGroup}>
            <label>Prescription Title *</label>
            <input className={styles.inputField} placeholder="e.g. Cardiology Rx, Monthly Insulin" value={rxTitle} onChange={e => setRxTitle(e.target.value)} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Doctor's Name</label>
              <input className={styles.inputField} placeholder="Dr. Jane Smith" value={rxDoctor} onChange={e => setRxDoctor(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Specialisation</label>
              <input className={styles.inputField} placeholder="Cardiology" value={rxSpec} onChange={e => setRxSpec(e.target.value)} />
            </div>
          </div>
          {/* File drop area */}
          <div
            className={`${styles.dropZone} ${rxFile ? styles.dropZoneActive : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) setRxFile(e.dataTransfer.files[0]); }}
          >
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={handleFileChange} />
            {rxFile ? (
              <>
                <span className={styles.dropZoneFileIcon}><FileText size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
                <p className={styles.dropZoneFilename}>{rxFile.name}</p>
                <p className={styles.dropZoneSize}>{(rxFile.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <span className={styles.dropZoneIcon}>⬆️</span>
                <p>Drag & drop or <strong>click to browse</strong></p>
                <p className={styles.dropZoneHint}>Supports JPG, PNG, PDF (max 10 MB)</p>
              </>
            )}
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-primary" onClick={saveRx} disabled={!rxTitle.trim()}>
              ⬆️ Upload
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* VIEW / DETAILS */}
      {modal === 'viewRx' && viewRx && (
        <Modal title="Prescription Details" onClose={closeModal}>
          {(() => { const sm = statusMeta(viewRx.status); return (
            <div className={styles.viewRxContent}>
              <div className={styles.viewRxBanner}>
                <div className={`${styles.viewRxStatusIcon} ${sm.bg}`}>
                  <span className={sm.txt} style={{ fontSize:'1.5rem' }}>{sm.icon}</span>
                </div>
                <div>
                  <h4 className={styles.viewRxTitle}>{viewRx.title}</h4>
                  <span className={`${styles.badge} ${sm.badge}`}>{viewRx.status}</span>
                </div>
              </div>
              <div className={styles.viewRxGrid}>
                <div className={styles.viewRxRow}><span>Patient</span><strong>{selectedPatient?.name}</strong></div>
                <div className={styles.viewRxRow}><span>Doctor</span><strong>{viewRx.doctor}</strong></div>
                <div className={styles.viewRxRow}><span>Specialisation</span><strong>{viewRx.spec}</strong></div>
                <div className={styles.viewRxRow}><span>Date Issued</span><strong>{viewRx.date}</strong></div>
                {viewRx.meds && <div className={styles.viewRxRow}><span>Medicines</span><strong>{viewRx.meds} prescribed</strong></div>}
                {viewRx.notes && <div className={styles.viewRxRow}><span>Notes</span><strong>{viewRx.notes}</strong></div>}
              </div>
              {viewRx.status === 'VERIFIED' && (
                <div className={styles.viewRxAction}>
                  <Link to="/medicines" className="btn btn-primary"><Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Order Medicines</Link>
                </div>
              )}
              {viewRx.status === 'REJECTED' && (
                <div className={styles.viewRxAction}>
                  <button className={styles.dangerBtn} onClick={() => { closeModal(); reupload(viewRx); }}>Re-upload Prescription</button>
                </div>
              )}
            </div>
          ); })()}
        </Modal>
      )}

      {/* DELETE PRESCRIPTION */}
      {modal === 'deleteRx' && delRx && (
        <Modal title="Delete Prescription" onClose={closeModal}>
          <div className={styles.deleteContent}>
            <div className={styles.deleteIcon}>📋</div>
            <p>Delete <strong>"{delRx.title}"</strong> for {selectedPatient?.name}?</p>
            <p className={styles.deleteNote}>This cannot be undone.</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.dangerBtn} onClick={executeDeleteRx}>Yes, Delete</button>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
