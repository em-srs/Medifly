import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import styles from './PrescriptionsPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { 
  Shield, User, Eye, FileText, CheckCircle2, Check, AlertTriangle, Pill, Calendar, Search, 
  Trash2, X, UserCircle2, Clock, Upload, Pencil, Truck, ShoppingBag, ArrowRight, PackageCheck 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// ─── Initial Seed / Mock Fallback ─────────────────────────────────────────────
const SEED_PATIENTS = [
  {
    id: 1,
    name: 'Arjun Mehta',
    relation: 'Self',
    dob: '1990-05-14',
    bloodGroup: 'B+',
    avatar: <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />,
    prescriptions: [
      { id: 101, title: 'Cardiology Rx – Apollo', doctor: 'Dr. Sunita Rao', spec: 'Cardiologist, Apollo Hospital', date: '2026-02-18', status: 'VERIFIED', meds: 3, notes: '', linkedOrderId: 501, linkedOrderStatus: 'in transit' },
      { id: 102, title: 'General Checkup', doctor: 'Dr. Ramesh Gupta', spec: 'General Physician', date: '2026-03-03', status: 'PENDING', meds: null, notes: 'Under review by pharmacist' },
    ],
    orders: [
      {
        id: 501,
        createdAt: '2026-02-18T10:30:00Z',
        status: 'in transit',
        totalPrice: 1240.00,
        linkedPrescriptionTitle: 'Cardiology Rx – Apollo',
        orderItems: [
          { id: 1, name: 'Telma 40mg Tablet', qty: 2, price: 240.00 },
          { id: 2, name: 'Eco-Sprin 75mg', qty: 1, price: 760.00 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Priya Mehta',
    relation: 'Spouse',
    dob: '1993-08-22',
    bloodGroup: 'O+',
    avatar: <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />,
    prescriptions: [
      { id: 201, title: 'Dermatology Rx – Skin Clinic', doctor: 'Dr. Kavitha Nair', spec: 'Dermatologist, Fortis Hospital', date: '2026-02-09', status: 'REJECTED', meds: null, notes: 'Prescription expired or stamp missing' },
    ],
    orders: []
  },
  {
    id: 3,
    name: 'Suresh Mehta',
    relation: 'Father',
    dob: '1958-03-10',
    bloodGroup: 'A+',
    avatar: <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />,
    prescriptions: [
      { id: 301, title: 'Orthopaedic Rx – Nanavati', doctor: 'Dr. Anil Joshi', spec: 'Orthopaedic Surgeon, Nanavati Hospital', date: '2026-02-22', status: 'VERIFIED', meds: 2, notes: '', linkedOrderId: 502, linkedOrderStatus: 'delivered' },
      { id: 302, title: 'Neurology Follow-up', doctor: 'Dr. Priya Krishnan', spec: 'Neurologist, Hinduja Hospital', date: '2026-03-07', status: 'VERIFIED', meds: 1, notes: 'Repeat prescription approved' },
    ],
    orders: [
      {
        id: 502,
        createdAt: '2026-02-23T14:15:00Z',
        status: 'delivered',
        totalPrice: 890.00,
        linkedPrescriptionTitle: 'Orthopaedic Rx – Nanavati',
        orderItems: [
          { id: 3, name: 'Shelcal 500mg Tablet', qty: 3, price: 296.60 }
        ]
      }
    ]
  },
];

const RELATIONS = ['Self', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Sibling', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const RELATION_AVATARS = { 
  Self:<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />, 
  Spouse:<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />, 
  Father:<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />, 
  Mother:<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />, 
  Son:<UserCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />, 
  Daughter:<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />, 
  Sibling:<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />, 
  Other:<User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> 
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusMeta(status) {
  if (status === 'VERIFIED') return { bg: styles.bgGreen,  txt: styles.textGreen,  badge: styles.badgeGreen,  icon: <Check size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> };
  if (status === 'PENDING')  return { bg: styles.bgYellow, txt: styles.textYellow, badge: styles.badgeYellow, icon: <Clock size={16} /> };
  return                            { bg: styles.bgRed,    txt: styles.textRed,    badge: styles.badgeRed,    icon: '!' };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  return (
    <div className={`${styles.toast} ${styles['toast' + type]}`}>
      <span>{type === 'success' ? <CheckCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> : type === 'warn' ? <AlertTriangle size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> : <Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />} {msg}</span>
      <button className={styles.toastClose} onClick={onClose}><X size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></button>
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.modal} ${wide ? styles.modalWide : ''}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}><X size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PrescriptionsPage() {
  const { user } = useAuth();
  const fileRef  = useRef(null);

  const headerRef = useScrollReveal(0.05);
  const rxGridRef = useScrollReveal(0.08);

  const [patients,         setPatients]         = useState([]);
  const [selectedId,       setSelectedId]       = useState(null);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [activeTab,        setActiveTab]        = useState('active');   // 'active'|'archived'|'orders'
  const [toast,            setToast]            = useState({ msg:'', type:'success' });
  const [modal,            setModal]            = useState(null);       // 'addPatient'|'editPatient'|'deletePatient'|'uploadRx'|'viewRx'|'deleteRx'
  const [memberOrders,     setMemberOrders]     = useState([]);
  const [loadingOrders,    setLoadingOrders]    = useState(false);

  // Patient form
  const [pForm,   setPForm]   = useState({ name:'', relation:'Self', dob:'', bloodGroup:'A+' });
  const [editPId, setEditPId] = useState(null);

  // Delete & View modals
  const [delPatient, setDelPatient] = useState(null);
  const [delRx,      setDelRx]      = useState(null);
  const [viewRx,     setViewRx]     = useState(null);

  // Upload form
  const [rxTitle,  setRxTitle]  = useState('');
  const [rxDoctor, setRxDoctor] = useState('');
  const [rxSpec,   setRxSpec]   = useState('');
  const [rxFile,   setRxFile]   = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:'', type:'success' }), 3500);
  };
  const closeModal = () => setModal(null);

  // Fetch Family Members from API on load
  const fetchMembers = useCallback(async () => {
    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    if (user?.clerkUser?.id) headers['X-Clerk-Id'] = user.clerkUser.id;
    if (user?.email) headers['X-User-Email'] = user.email;

    try {
      const res = await fetch(`${API_BASE}/api/vault/members`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(m => ({
            ...m,
            avatar: RELATION_AVATARS[m.relation] || <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />,
            prescriptions: m.prescriptions || [],
            orders: m.orders || []
          }));
          setPatients(formatted);
          if (!selectedId || !formatted.find(f => f.id === selectedId)) {
            setSelectedId(formatted[0].id);
          }
        } else if (user?.name) {
          const fallbackMember = {
            id: user.id || 1,
            name: user.name,
            relation: 'Self',
            bloodGroup: user.bloodGroup || 'A+',
            avatar: <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />,
            prescriptions: [],
            orders: []
          };
          setPatients([fallbackMember]);
          setSelectedId(fallbackMember.id);
        }
      }
    } catch (err) {
      console.warn('API error fetching family members:', err.message);
    }
  }, [user, selectedId]);

  // Fetch prescriptions & orders for selected member
  const fetchMemberDetails = useCallback(async (memberId) => {
    if (!memberId) return;
    setLoadingOrders(true);

    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    if (user?.clerkUser?.id) headers['X-Clerk-Id'] = user.clerkUser.id;
    if (user?.email) headers['X-User-Email'] = user.email;

    try {
      // 1. Member Prescriptions
      const rxRes = await fetch(`${API_BASE}/api/vault/members/${memberId}/prescriptions`, { headers });
      if (rxRes.ok) {
        const rxData = await rxRes.json();
        setPatients(prev => prev.map(p => p.id === memberId ? { ...p, prescriptions: rxData } : p));
      }

      // 2. Member Orders (Ownership secured server-side)
      const ordRes = await fetch(`${API_BASE}/api/vault/members/${memberId}/orders`, { headers });
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setMemberOrders(ordData);
        setPatients(prev => prev.map(p => p.id === memberId ? { ...p, orders: ordData } : p));
      } else {
        const p = patients.find(x => x.id === memberId);
        setMemberOrders(p?.orders || []);
      }
    } catch (err) {
      const p = patients.find(x => x.id === memberId);
      setMemberOrders(p?.orders || []);
    } finally {
      setLoadingOrders(false);
    }
  }, [user, patients]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (selectedId) {
      fetchMemberDetails(selectedId);
    }
  }, [selectedId, fetchMemberDetails]);

  // Derived state
  const selectedPatient = patients.find(p => p.id === selectedId) || patients[0];
  const isArchived = (rx) => rx.status === 'VERIFIED' && new Date(rx.date) < new Date(Date.now() - 180 * 86400000);
  const shownRxs = (selectedPatient?.prescriptions || []).filter(rx => {
    const arch = isArchived(rx);
    const match = (rx.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (rx.doctor || '').toLowerCase().includes(searchQuery.toLowerCase());
    return (activeTab === 'archived' ? arch : !arch) && match;
  });

  const displayOrders = memberOrders.length > 0 ? memberOrders : (selectedPatient?.orders || []);

  // ── Patient Handlers ────────────────────────────────────────────────────────
  const openAddPatient = () => {
    setPForm({ name:'', relation:'Self', dob:'', bloodGroup:'A+' });
    setEditPId(null);
    setModal('addPatient');
  };
  const openEditPatient = (p) => {
    setPForm({ name: p.name, relation: p.relation, dob: p.dob || '', bloodGroup: p.bloodGroup || 'A+' });
    setEditPId(p.id);
    setModal('addPatient');
  };
  const savePatient = async () => {
    if (!pForm.name.trim()) return;

    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    if (user?.clerkUser?.id) headers['X-Clerk-Id'] = user.clerkUser.id;
    if (user?.email) headers['X-User-Email'] = user.email;

    try {
      const url = editPId ? `${API_BASE}/api/vault/members/${editPId}` : `${API_BASE}/api/vault/members`;
      const method = editPId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(pForm)
      });

      if (res.ok) {
        const saved = await res.json();
        const avatar = RELATION_AVATARS[pForm.relation] || <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
        if (editPId) {
          setPatients(prev => prev.map(p => p.id === editPId ? { ...p, ...saved, avatar } : p));
          showToast(`${pForm.name} updated!`);
        } else {
          const np = { ...saved, avatar, prescriptions: [], orders: [] };
          setPatients(prev => [...prev, np]);
          setSelectedId(np.id);
          showToast(`${pForm.name} added as a patient!`);
        }
      } else {
        if (editPId) {
          setPatients(prev => prev.map(p => p.id === editPId ? { ...p, ...pForm, avatar: RELATION_AVATARS[pForm.relation] } : p));
        } else {
          const np = { id: Date.now(), ...pForm, avatar: RELATION_AVATARS[pForm.relation], prescriptions: [], orders: [] };
          setPatients(prev => [...prev, np]);
          setSelectedId(np.id);
        }
        showToast(`${pForm.name} saved!`);
      }
    } catch (err) {
      showToast(`${pForm.name} saved locally.`, 'warn');
    }
    closeModal();
  };

  const confirmDeletePatient = (p) => { setDelPatient(p); setModal('deletePatient'); };
  const executeDeletePatient = async () => {
    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    if (user?.clerkUser?.id) headers['X-Clerk-Id'] = user.clerkUser.id;
    if (user?.email) headers['X-User-Email'] = user.email;

    try {
      await fetch(`${API_BASE}/api/vault/members/${delPatient.id}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      // Ignore API error
    }
    setPatients(prev => prev.filter(p => p.id !== delPatient.id));
    if (selectedId === delPatient.id && patients.length > 1) {
      setSelectedId(patients.find(p => p.id !== delPatient.id)?.id);
    }
    showToast(`${delPatient.name} removed.`, 'warn');
    setDelPatient(null); closeModal();
  };

  // ── Prescription Handlers ───────────────────────────────────────────────────
  const openUpload = () => { setRxTitle(''); setRxDoctor(''); setRxSpec(''); setRxFile(null); setModal('uploadRx'); };
  const handleFileChange = (e) => { if (e.target.files[0]) setRxFile(e.target.files[0]); };
  
  const saveRx = async () => {
    if (!rxTitle.trim()) return;

    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    if (user?.clerkUser?.id) headers['X-Clerk-Id'] = user.clerkUser.id;
    if (user?.email) headers['X-User-Email'] = user.email;

    try {
      const res = await fetch(`${API_BASE}/api/vault/members/${selectedId}/prescriptions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: rxTitle,
          doctor: rxDoctor,
          spec: rxSpec,
          documentUrl: rxFile ? URL.createObjectURL(rxFile) : undefined
        })
      });

      if (res.ok) {
        const newRx = await res.json();
        setPatients(prev => prev.map(p => p.id === selectedId ? { ...p, prescriptions: [newRx, ...p.prescriptions] } : p));
      } else {
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
        setPatients(prev => prev.map(p => p.id === selectedId ? { ...p, prescriptions: [newRx, ...p.prescriptions] } : p));
      }
    } catch (err) {
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
      setPatients(prev => prev.map(p => p.id === selectedId ? { ...p, prescriptions: [newRx, ...p.prescriptions] } : p));
    }
    closeModal();
    showToast(`Prescription uploaded for ${selectedPatient.name}!`);
  };

  const openViewRx = (rx) => { setViewRx(rx); setModal('viewRx'); };
  const confirmDeleteRx = (rx) => { setDelRx(rx); setModal('deleteRx'); };
  const executeDeleteRx = () => {
    setPatients(prev => prev.map(p => p.id === selectedId ? { ...p, prescriptions: p.prescriptions.filter(r => r.id !== delRx.id) } : p));
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

      {/* ── Main ── */}
      <main className={styles.main}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerShieldIcon}><Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>
            <h2>Prescription Vault</h2>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}><Search size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>
              <input
                type="text"
                placeholder="Search prescriptions or doctors…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Two-Panel Layout */}
        <div className={styles.panels}>

          {/* ── LEFT: Patient List Panel ── */}
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
                    <span className={styles.patientRxCount}>{(p.prescriptions || []).length} prescription{(p.prescriptions || []).length !== 1 ? 's' : ''}</span>
                  </div>
                  {selectedId === p.id ? (
                    <div className={styles.patientActions}>
                      <button className={styles.pActionBtn} onClick={e => { e.stopPropagation(); openEditPatient(p); }} title="Edit"><Pencil size={14} /></button>
                      <button className={styles.pActionBtn} onClick={e => { e.stopPropagation(); confirmDeletePatient(p); }} title="Remove"><Trash2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></button>
                    </div>
                  ) : (
                    <span className={styles.patientArrow}>›</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Details Panel for Selected Patient ── */}
          <div className={styles.rxPanel}>
            {/* Panel Header */}
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
                <Upload size={16} /> Upload Prescription
              </button>
            </div>

            {/* Tabs (Active Prescriptions | Archived | Orders) */}
            <div className={styles.tabs}>
              {[
                ['active', 'Active Prescriptions'], 
                ['archived', 'Archived'], 
                ['orders', `Orders (${displayOrders.length})`]
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <div>
                {loadingOrders ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading {selectedPatient?.name}'s order history...</p>
                ) : displayOrders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><ShoppingBag size={24} /></div>
                    <h3>No orders linked yet</h3>
                    <p>Orders placed for {selectedPatient?.name}'s prescriptions will appear here.</p>
                    <Link to="/medicines" className="btn btn-primary"><ShoppingBag size={16} /> Browse Shop</Link>
                  </div>
                ) : (
                  <div className={styles.ordersGrid}>
                    {displayOrders.map((ord) => {
                      const statusClass = 
                        ord.status === 'delivered' ? styles.statusDelivered :
                        ord.status === 'in transit' || ord.status === 'dispatched' ? styles.statusTransit :
                        ord.status === 'verified' ? styles.statusVerified : styles.statusProcessing;

                      const statusIcon = 
                        ord.status === 'delivered' ? <PackageCheck size={14} /> :
                        ord.status === 'in transit' || ord.status === 'dispatched' ? <Truck size={14} /> :
                        <Clock size={14} />;

                      return (
                        <div key={ord.id} className={styles.orderCard}>
                          <div className={styles.orderCardHeader}>
                            <div>
                              <span className={styles.orderId}>Order #{ord.id}</span>
                              <span className={styles.orderDate}>
                                {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                              </span>
                            </div>
                            <span className={`${styles.orderStatusChip} ${statusClass}`}>
                              {statusIcon} {ord.status}
                            </span>
                          </div>

                          {ord.linkedPrescriptionTitle && (
                            <p style={{ fontSize: '0.8rem', color: '#0ea5e9', fontWeight: 600, marginBottom: '0.75rem' }}>
                              📄 Linked Rx: {ord.linkedPrescriptionTitle}
                            </p>
                          )}

                          <div className={styles.orderItems}>
                            {(ord.orderItems || ord.items || []).map((item, idx) => (
                              <div key={idx} className={styles.orderItemRow}>
                                <span>{item.name} (x{item.qty})</span>
                                <strong>₹{((item.price || 0) * (item.qty || 1)).toFixed(2)}</strong>
                              </div>
                            ))}
                          </div>

                          <div className={styles.orderFooter}>
                            <span className={styles.orderTotal}>Total: ₹{(ord.totalPrice || ord.total_price || 0).toFixed(2)}</span>
                            <Link to="/orders" className={`btn btn-sm btn-ghost`} style={{ gap: '4px', fontSize: '0.8rem' }}>
                              Track Order <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── PRESCRIPTIONS GRID (ACTIVE / ARCHIVED TABS) ── */}
            {activeTab !== 'orders' && (
              shownRxs.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><FileText size={24} /></div>
                  <h3>No prescriptions yet</h3>
                  <p>{activeTab === 'archived' ? 'No archived prescriptions for this patient.' : `Upload ${selectedPatient?.name}'s first prescription to get started.`}</p>
                  {activeTab === 'active' && (
                    <button className="btn btn-primary" onClick={openUpload}><Upload size={16} /> Upload Prescription</button>
                  )}
                </div>
              ) : (
                <div className={styles.grid} ref={rxGridRef}>
                  {shownRxs.map((rx, i) => {
                    const sm = statusMeta(rx.status);
                    
                    // Check if an order exists for this prescription
                    const linkedOrder = displayOrders.find(o => o.prescriptionId === rx.id || o.linkedPrescriptionTitle === rx.title) || 
                      (rx.linkedOrderId ? { id: rx.linkedOrderId, status: rx.linkedOrderStatus || 'in transit' } : null);

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
                            <p><span><UserCircle2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>{rx.doctor}</p>
                            <p><span><Calendar size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>Issued: {rx.date}</p>
                            {rx.meds  && <p><span><Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>{rx.meds} medicine{rx.meds > 1 ? 's' : ''} prescribed</p>}
                            {rx.notes && <p className={rx.status === 'REJECTED' ? styles.errorText : ''}><span><FileText size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>{rx.notes}</p>}
                          </div>
                        </div>

                        {/* Card Footer Action: Replaces/augments "Order Now" with Order Status Chip if an order has been placed */}
                        <div className={styles.cardFooter}>
                          {rx.status === 'VERIFIED' && (
                            linkedOrder ? (
                              <Link to="/orders" className={styles.statusChip} title="View order tracking">
                                <Truck size={14} /> {linkedOrder.status === 'delivered' ? 'Ordered — Delivered' : `Ordered — ${linkedOrder.status || 'In Transit'}`}
                              </Link>
                            ) : (
                              <Link 
                                to={`/medicines?prescriptionId=${rx.id}&familyMemberId=${selectedPatient.id}`} 
                                className={`btn btn-primary ${styles.actionBtn}`}
                              >
                                Order Now
                              </Link>
                            )
                          )}
                          {rx.status === 'PENDING' && (
                            <button className={`btn ${styles.disabledBtn} ${styles.actionBtn}`} disabled>Awaiting Verification</button>
                          )}
                          {rx.status === 'REJECTED' && (
                            <button className={`btn ${styles.borderBtn} ${styles.actionBtn}`} onClick={() => reupload(rx)}>Re-upload</button>
                          )}
                          <button className={styles.iconActionBtn} title="View details" onClick={() => openViewRx(rx)}><Eye size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></button>
                          <button className={`${styles.iconActionBtn} ${styles.iconDelBtn}`} title="Delete" onClick={() => confirmDeleteRx(rx)}><Trash2 size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Archive hint */}
            {activeTab === 'active' && (selectedPatient?.prescriptions || []).length > 0 && (
              <div className={styles.archiveHint}>
                <span><FileText size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>
                <p>Prescriptions older than 6 months are auto-archived. <button className={styles.textBtn} onClick={() => setActiveTab('archived')}>View archived →</button></p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── MODALS ── */}

      {/* Add / Edit Patient Modal */}
      {modal === 'addPatient' && (
        <Modal title={editPId ? 'Edit Patient Profile' : 'Add Family Member'} onClose={closeModal}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input
                className={styles.inputField}
                type="text"
                placeholder="e.g. Ananya Mehta"
                value={pForm.name}
                onChange={e => setPForm({ ...pForm, name: e.target.value })}
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Relationship</label>
                <select
                  className={styles.inputField}
                  value={pForm.relation}
                  onChange={e => setPForm({ ...pForm, relation: e.target.value })}
                >
                  {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Blood Group</label>
                <select
                  className={styles.inputField}
                  value={pForm.bloodGroup}
                  onChange={e => setPForm({ ...pForm, bloodGroup: e.target.value })}
                >
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Date of Birth</label>
              <input
                className={styles.inputField}
                type="date"
                value={pForm.dob}
                onChange={e => setPForm({ ...pForm, dob: e.target.value })}
              />
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-primary" onClick={savePatient}>Save Patient</button>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Patient Confirmation Modal */}
      {modal === 'deletePatient' && delPatient && (
        <Modal title="Remove Patient Profile" onClose={closeModal}>
          <div className={styles.deleteContent}>
            <div className={styles.deleteIcon}>⚠️</div>
            <p>Are you sure you want to remove <strong>{delPatient.name}</strong>?</p>
            <p className={styles.deleteNote}>This will also remove all associated prescriptions and order links for this patient profile.</p>
            <div className={styles.modalFooter}>
              <button className={styles.dangerBtn} onClick={executeDeletePatient}>Delete Profile</button>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Prescription Modal */}
      {modal === 'uploadRx' && (
        <Modal title={`Upload Prescription for ${selectedPatient?.name}`} onClose={closeModal}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Prescription Title / Condition *</label>
              <input
                className={styles.inputField}
                type="text"
                placeholder="e.g. Cardiology Follow-up"
                value={rxTitle}
                onChange={e => setRxTitle(e.target.value)}
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Doctor's Name</label>
                <input
                  className={styles.inputField}
                  type="text"
                  placeholder="e.g. Dr. Sunita Rao"
                  value={rxDoctor}
                  onChange={e => setRxDoctor(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Specialty / Hospital</label>
                <input
                  className={styles.inputField}
                  type="text"
                  placeholder="e.g. Cardiologist, Apollo"
                  value={rxSpec}
                  onChange={e => setRxSpec(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Prescription File / Photo</label>
              <div 
                className={`${styles.dropZone} ${rxFile ? styles.dropZoneActive : ''}`} 
                onClick={() => fileRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept="image/*,.pdf" 
                />
                {rxFile ? (
                  <>
                    <span className={styles.dropZoneFileIcon}>📄</span>
                    <p className={styles.dropZoneFilename}>{rxFile.name}</p>
                    <p className={styles.dropZoneSize}>{(rxFile.size / 1024).toFixed(1)} KB</p>
                  </>
                ) : (
                  <>
                    <span className={styles.dropZoneIcon}><Upload size={24} /></span>
                    <p>Click or drag prescription photo/PDF here</p>
                    <span className={styles.dropZoneHint}>Supports JPG, PNG, PDF up to 10MB</span>
                  </>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-primary" onClick={saveRx}>Submit for Verification</button>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Prescription Details Modal */}
      {modal === 'viewRx' && viewRx && (
        <Modal title={viewRx.title} onClose={closeModal} wide>
          <div className={styles.viewRxContent}>
            <div className={styles.viewRxBanner}>
              <div className={`${styles.viewRxStatusIcon} ${statusMeta(viewRx.status).bg}`}>
                <span className={statusMeta(viewRx.status).txt}>{statusMeta(viewRx.status).icon}</span>
              </div>
              <div>
                <h4 className={styles.viewRxTitle}>{viewRx.title}</h4>
                <span className={`${styles.badge} ${statusMeta(viewRx.status).badge}`}>{viewRx.status}</span>
              </div>
            </div>

            <div className={styles.viewRxGrid}>
              <div className={styles.viewRxRow}><span>Patient</span><strong>{selectedPatient?.name} ({selectedPatient?.relation})</strong></div>
              <div className={styles.viewRxRow}><span>Doctor</span><strong>{viewRx.doctor}</strong></div>
              <div className={styles.viewRxRow}><span>Specialty</span><strong>{viewRx.spec}</strong></div>
              <div className={styles.viewRxRow}><span>Issued Date</span><strong>{viewRx.date}</strong></div>
              {viewRx.meds && <div className={styles.viewRxRow}><span>Medicines Prescribed</span><strong>{viewRx.meds} items</strong></div>}
              {viewRx.notes && <div className={styles.viewRxRow}><span>Pharmacist Notes</span><strong>{viewRx.notes}</strong></div>}
            </div>

            <div className={styles.viewRxAction}>
              {viewRx.status === 'VERIFIED' && (
                <Link to={`/medicines?prescriptionId=${viewRx.id}&familyMemberId=${selectedPatient.id}`} className="btn btn-primary" onClick={closeModal}>Order Medicines</Link>
              )}
              <button className={styles.cancelBtn} onClick={closeModal}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Prescription Modal */}
      {modal === 'deleteRx' && delRx && (
        <Modal title="Delete Prescription" onClose={closeModal}>
          <div className={styles.deleteContent}>
            <div className={styles.deleteIcon}>⚠️</div>
            <p>Are you sure you want to delete <strong>{delRx.title}</strong>?</p>
            <p className={styles.deleteNote}>This action cannot be undone.</p>
            <div className={styles.modalFooter}>
              <button className={styles.dangerBtn} onClick={executeDeleteRx}>Delete Prescription</button>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
