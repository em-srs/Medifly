import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import styles from './PrescriptionsPage.module.css';
import useScrollReveal from '@/hooks/useScrollReveal';
import { 
  Shield, User, Eye, FileText, CheckCircle2, Check, AlertTriangle, Pill, Calendar, Search, 
  Trash2, X, UserCircle2, Clock, Upload, Pencil, Truck, ShoppingBag, ArrowRight, PackageCheck,
  ExternalLink, FileSpreadsheet, Lock, Layers
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

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

  const [patients,         setPatients]         = useState([]);
  const [selectedId,       setSelectedId]       = useState(null);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [activeTab,        setActiveTab]        = useState('active');   // 'active'|'archived'|'orders'
  const [toast,            setToast]            = useState({ msg:'', type:'success' });
  const [modal,            setModal]            = useState(null);       // 'addPatient'|'editPatient'|'deletePatient'|'uploadRx'|'viewRx'|'deleteRx'|'adminAttribution'
  const [memberOrders,     setMemberOrders]     = useState([]);
  const [loadingOrders,    setLoadingOrders]    = useState(false);
  const [loadingRxs,       setLoadingRxs]       = useState(false);

  // Patient form
  const [pForm,   setPForm]   = useState({ name:'', relation:'Self', dob:'', bloodGroup:'A+' });
  const [editPId, setEditPId] = useState(null);

  // Delete & View modals
  const [delPatient, setDelPatient] = useState(null);
  const [delRx,      setDelRx]      = useState(null);
  const [viewRx,     setViewRx]     = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Upload form
  const [rxTitle,  setRxTitle]  = useState('');
  const [rxDoctor, setRxDoctor] = useState('');
  const [rxSpec,   setRxSpec]   = useState('');
  const [rxFile,   setRxFile]   = useState(null);
  const [uploading, setUploading] = useState(false);

  // Admin Attribution state
  const [attributionData, setAttributionData] = useState([]);
  const [loadingAttribution, setLoadingAttribution] = useState(false);

  const isElevatedRole = ['pharmacy', 'admin', 'super_admin'].includes(user?.role);
  const isAdminRole = ['admin', 'super_admin'].includes(user?.role);

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
        }
      }
    } catch (err) {
      console.warn('API error fetching family members:', err.message);
    }
  }, [user, selectedId]);

  // Fetch prescriptions & orders for selected member
  const fetchMemberDetails = useCallback(async (memberId) => {
    if (!memberId) return;
    setLoadingRxs(true);
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

      // 2. Member Orders
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
      setLoadingRxs(false);
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
  const isArchived = (rx) => Boolean(rx.archivedAt) || (rx.status === 'VERIFIED' && new Date(rx.date) < new Date(Date.now() - 180 * 86400000));
  
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
      }
    } catch (err) {
      showToast('Error saving patient profile', 'warn');
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
      setPatients(prev => prev.filter(p => p.id !== delPatient.id));
      if (selectedId === delPatient.id && patients.length > 1) {
        setSelectedId(patients.find(p => p.id !== delPatient.id)?.id);
      }
      showToast(`${delPatient.name} removed.`, 'warn');
    } catch (err) {
      showToast('Error deleting patient', 'warn');
    }
    setDelPatient(null); closeModal();
  };

  // ── Prescription Handlers ───────────────────────────────────────────────────
  const openUpload = () => { 
    setRxTitle(''); 
    setRxDoctor(''); 
    setRxSpec(''); 
    setRxFile(null); 
    setModal('uploadRx'); 
  };
  
  const handleFileChange = (e) => { 
    if (e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 10 * 1024 * 1024) {
        showToast('File exceeds 10MB limit. Please select a smaller file.', 'warn');
        return;
      }
      setRxFile(f);
    } 
  };
  
  const saveRx = async () => {
    if (!rxTitle.trim()) {
      showToast('Prescription title / condition is required', 'warn');
      return;
    }
    if (!rxFile) {
      showToast('Please select a prescription document file (JPG, PNG, or PDF)', 'warn');
      return;
    }

    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (user?.clerkUser?.id) headers['X-Clerk-Id'] = user.clerkUser.id;
    if (user?.email) headers['X-User-Email'] = user.email;

    const formData = new FormData();
    formData.append('title', rxTitle.trim());
    formData.append('doctorName', rxDoctor.trim());
    formData.append('specialtyHospital', rxSpec.trim());
    formData.append('file', rxFile);

    try {
      setUploading(true);
      const res = await fetch(`${API_BASE}/api/vault/members/${selectedId}/prescriptions`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Prescription uploaded successfully for ${selectedPatient?.name || 'patient'}!`);
        closeModal();
        fetchMemberDetails(selectedId);
      } else {
        showToast(data.message || 'Failed to upload prescription', 'warn');
      }
    } catch (err) {
      console.error('Error uploading prescription:', err);
      showToast('Upload failed. Please check network connection.', 'warn');
    } finally {
      setUploading(false);
    }
  };

  const openViewRx = (rx) => { setViewRx(rx); setReviewNotes(rx.notes || ''); setModal('viewRx'); };
  const confirmDeleteRx = (rx) => { setDelRx(rx); setModal('deleteRx'); };
  
  const executeDeleteRx = async () => {
    if (!delRx) return;
    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    if (user?.clerkUser?.id) headers['X-Clerk-Id'] = user.clerkUser.id;
    if (user?.email) headers['X-User-Email'] = user.email;

    try {
      const res = await fetch(`${API_BASE}/api/vault/prescriptions/${delRx.id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        showToast('Prescription deleted successfully', 'warn');
        fetchMemberDetails(selectedId);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to delete prescription', 'warn');
      }
    } catch (err) {
      showToast('Error deleting prescription', 'warn');
    }
    setDelRx(null);
    closeModal();
  };

  // Review status update for Pharmacist / Admin
  const handleReviewStatus = async (newStatus) => {
    if (!viewRx) return;
    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    if (user?.clerkUser?.id) headers['X-Clerk-Id'] = user.clerkUser.id;

    try {
      const res = await fetch(`${API_BASE}/api/vault/prescriptions/${viewRx.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus, notes: reviewNotes }),
      });
      if (res.ok) {
        showToast(`Prescription status updated to ${newStatus}`);
        closeModal();
        fetchMemberDetails(selectedId);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to update status', 'warn');
      }
    } catch (err) {
      showToast('Error updating prescription review', 'warn');
    }
  };

  // Admin Vault Attribution Modal
  const openAdminAttribution = async () => {
    setModal('adminAttribution');
    setLoadingAttribution(true);
    const token = user?.token || localStorage.getItem('medifly_token');
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/vault/attribution`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAttributionData(data.accounts || []);
      }
    } catch (err) {
      console.error('Error fetching admin attribution:', err);
    } finally {
      setLoadingAttribution(false);
    }
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
            {isAdminRole && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={openAdminAttribution}
                style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Layers size={16} /> Admin Attribution Breakdown
              </button>
            )}
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
                  <div className={styles.patientInfo}>
                    <div className={styles.patientNameRow}>
                      <strong className={styles.patientName}>{p.name}</strong>
                      <span className={styles.relationTag}>{p.relation}</span>
                    </div>
                    <span className={styles.patientSub}>
                      {p.bloodGroup} • {p.prescriptions?.length || 0} Rx records
                    </span>
                  </div>
                  <div className={styles.patientActions} onClick={e => e.stopPropagation()}>
                    <button className={styles.iconActionBtn} onClick={() => openEditPatient(p)} title="Edit patient">
                      <Pencil size={14} />
                    </button>
                    {patients.length > 1 && (
                      <button className={styles.iconActionBtn} onClick={() => confirmDeletePatient(p)} title="Remove patient">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Selected Patient Vault Content ── */}
          <div className={styles.vaultPanel}>
            {selectedPatient ? (
              <>
                {/* Member Header Card */}
                <div className={styles.memberHeaderCard}>
                  <div className={styles.memberAvatarLarge}>{selectedPatient.avatar}</div>
                  <div className={styles.memberHeaderMeta}>
                    <div className={styles.memberTitleRow}>
                      <h3>{selectedPatient.name}</h3>
                      <span className={styles.memberRelationBadge}>{selectedPatient.relation}</span>
                      <span className={styles.patientIdChip}>
                        Patient ID: MF-{String(selectedPatient.id).padStart(5, '0')}-A
                      </span>
                    </div>
                    <p className={styles.memberSubDetails}>
                      Blood Group: <strong>{selectedPatient.bloodGroup || 'A+'}</strong>
                      {selectedPatient.dob && <> • DOB: <strong>{selectedPatient.dob}</strong></>}
                    </p>
                  </div>
                  <button className="btn btn-primary" onClick={openUpload} style={{ marginLeft: 'auto' }}>
                    <Upload size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                    Upload Rx
                  </button>
                </div>

                {/* Tabs */}
                <div className={styles.tabsRow}>
                  <button
                    className={`${styles.tabBtn} ${activeTab === 'active' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('active')}
                  >
                    Active Prescriptions ({(selectedPatient.prescriptions || []).filter(r => !isArchived(r)).length})
                  </button>
                  <button
                    className={`${styles.tabBtn} ${activeTab === 'archived' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('archived')}
                  >
                    Archived ({(selectedPatient.prescriptions || []).filter(r => isArchived(r)).length})
                  </button>
                  <button
                    className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabBtnActive : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    Order History ({displayOrders.length})
                  </button>
                </div>

                {/* TAB 1 & 2: Active / Archived Prescriptions */}
                {(activeTab === 'active' || activeTab === 'archived') && (
                  <div className={styles.rxGrid}>
                    {shownRxs.length === 0 ? (
                      <div className={styles.emptyState}>
                        <FileText size={42} style={{ color: 'var(--slate-400)', marginBottom: '12px' }} />
                        <h4>No {activeTab} prescriptions found</h4>
                        <p>Upload a doctor's prescription for {selectedPatient.name} to track medication history.</p>
                        <button className="btn btn-outline" onClick={openUpload} style={{ marginTop: '12px' }}>
                          Upload Prescription
                        </button>
                      </div>
                    ) : (
                      shownRxs.map(rx => (
                        <div key={rx.id} className={styles.rxCard}>
                          <div className={styles.rxCardHeader}>
                            <div className={styles.rxCardTitleWrap}>
                              <h4 className={styles.rxTitle}>{rx.title}</h4>
                              <span className={`${styles.badge} ${statusMeta(rx.status).badge}`}>
                                {statusMeta(rx.status).icon} {rx.status}
                              </span>
                            </div>
                            <div className={styles.rxCardActions}>
                              <button className={styles.iconBtn} onClick={() => openViewRx(rx)} title="View prescription">
                                <Eye size={16} />
                              </button>
                              <button className={styles.iconBtn} onClick={() => confirmDeleteRx(rx)} title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className={styles.rxMetaList}>
                            <div className={styles.rxMetaItem}>
                              <span>Doctor:</span> <strong>{rx.doctor}</strong>
                            </div>
                            <div className={styles.rxMetaItem}>
                              <span>Facility:</span> <strong>{rx.spec}</strong>
                            </div>
                            <div className={styles.rxMetaItem}>
                              <span>Uploaded:</span> <strong>{rx.date}</strong>
                            </div>
                            {rx.notes && (
                              <div className={styles.rxMetaItem} style={{ gridColumn: '1 / -1', color: 'var(--slate-500)', fontSize: '0.8rem' }}>
                                <span>Note:</span> {rx.notes}
                              </div>
                            )}
                          </div>

                          <div className={styles.rxCardFooter}>
                            {rx.status === 'VERIFIED' ? (
                              <Link
                                to={`/medicines?prescriptionId=${rx.id}&familyMemberId=${selectedPatient.id}`}
                                className="btn btn-sm btn-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                              >
                                Order Medicines for {selectedPatient.name.split(' ')[0]} <ArrowRight size={14} />
                              </Link>
                            ) : rx.status === 'REJECTED' ? (
                              <button className="btn btn-sm btn-outline" onClick={() => openUpload()} style={{ width: '100%', justifyContent: 'center' }}>
                                Re-upload Prescription
                              </button>
                            ) : (
                              <span className={styles.pendingText}>
                                <Clock size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                                Pharmacist reviewing document...
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 3: Member Order History */}
                {activeTab === 'orders' && (
                  <div className={styles.ordersContainer}>
                    {loadingOrders ? (
                      <div className={styles.emptyState}>Loading orders...</div>
                    ) : displayOrders.length === 0 ? (
                      <div className={styles.emptyState}>
                        <ShoppingBag size={42} style={{ color: 'var(--slate-400)', marginBottom: '12px' }} />
                        <h4>No orders for {selectedPatient.name} yet</h4>
                        <p>Orders placed for this family member will appear here.</p>
                      </div>
                    ) : (
                      displayOrders.map(ord => (
                        <div key={ord.id} className={styles.orderCard}>
                          <div className={styles.orderCardHeader}>
                            <div>
                              <strong>Order #{ord.id}</strong>
                              <span className={styles.orderDate}>
                                 • {new Date(ord.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={`badge ${ord.status === 'delivered' ? 'badge-green' : 'badge-blue'}`}>
                              {ord.status}
                            </span>
                          </div>
                          <div className={styles.orderItemList}>
                            {(ord.orderItems || []).map((item, idx) => (
                              <div key={idx} className={styles.orderItemRow}>
                                <span>{item.name} × {item.qty}</span>
                                <strong>₹{(item.price * item.qty).toFixed(2)}</strong>
                              </div>
                            ))}
                          </div>
                          <div className={styles.orderCardFooter}>
                            <span>Total Amount: <strong>₹{(ord.totalPrice || 0).toFixed(2)}</strong></span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>Select a family member profile on the left.</div>
            )}
          </div>
        </div>
      </main>

      {/* ── Modals ── */}

      {/* Add / Edit Patient Modal */}
      {modal === 'addPatient' && (
        <Modal title={editPId ? 'Edit Family Profile' : 'Add Family Profile'} onClose={closeModal}>
          <div className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input
                className={styles.inputField}
                type="text"
                placeholder="e.g. Riya Mehta"
                value={pForm.name}
                onChange={e => setPForm({ ...pForm, name: e.target.value })}
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Relation</label>
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
              <button className="btn btn-primary" onClick={savePatient}>Save Profile</button>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Prescription Modal */}
      {modal === 'uploadRx' && (
        <Modal title={`Upload Prescription for ${selectedPatient?.name}`} onClose={closeModal}>
          <div className={styles.modalForm}>
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
              <label>Prescription File / Photo *</label>
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
              <button className="btn btn-primary" onClick={saveRx} disabled={uploading}>
                {uploading ? 'Uploading File...' : 'Submit for Verification'}
              </button>
              <button className={styles.cancelBtn} onClick={closeModal} disabled={uploading}>Cancel</button>
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
              <div className={styles.viewRxRow}><span>Facility</span><strong>{viewRx.spec}</strong></div>
              <div className={styles.viewRxRow}><span>Issued Date</span><strong>{viewRx.date}</strong></div>
              <div className={styles.viewRxRow}><span>Review Notes</span><strong>{viewRx.notes || 'Pending review'}</strong></div>
              {viewRx.uploadedByName && <div className={styles.viewRxRow}><span>Uploaded By</span><strong>{viewRx.uploadedByName}</strong></div>}
            </div>

            {/* Document Preview / Download Link */}
            {viewRx.documentUrl && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--slate-100)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                    📄 Signed Document Asset (10-Min Expiry)
                  </span>
                  <a
                    href={viewRx.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Open Document <ExternalLink size={14} />
                  </a>
                </div>
                {viewRx.fileType?.includes('image') && (
                  <img
                    src={viewRx.documentUrl}
                    alt={viewRx.title}
                    style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--slate-300)' }}
                  />
                )}
              </div>
            )}

            {/* Elevated Pharmacist / Admin Review Controls */}
            {isElevatedRole && (
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(13, 148, 136, 0.08)', borderRadius: '12px', border: '1.5px solid var(--teal-500)' }}>
                <h5 style={{ margin: '0 0 10px 0', color: 'var(--teal-800)', fontSize: '0.95rem' }}>
                  ⚙️ Pharmacist / Admin Verification Panel
                </h5>
                <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--slate-700)' }}>Reviewer Notes / Rejection Reason</label>
                  <input
                    className={styles.inputField}
                    type="text"
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Enter review feedback or rejection reason..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleReviewStatus('VERIFIED')}>
                    <Check size={14} /> Approve & Verify Rx
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleReviewStatus('REJECTED')} style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
                    <X size={14} /> Reject Prescription
                  </button>
                </div>
              </div>
            )}

            <div className={styles.viewRxAction}>
              {viewRx.status === 'VERIFIED' && (
                <Link to={`/medicines?prescriptionId=${viewRx.id}&familyMemberId=${selectedPatient.id}`} className="btn btn-primary" onClick={closeModal}>Order Medicines</Link>
              )}
              <button className={styles.cancelBtn} onClick={closeModal}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Patient Confirmation Modal */}
      {modal === 'deletePatient' && delPatient && (
        <Modal title="Remove Family Profile" onClose={closeModal}>
          <div className={styles.deleteContent}>
            <div className={styles.deleteIcon}>⚠️</div>
            <p>Are you sure you want to remove <strong>{delPatient.name}</strong> ({delPatient.relation})?</p>
            <p className={styles.deleteNote}>All prescriptions associated with this profile will be archived.</p>
            <div className={styles.modalFooter}>
              <button className={styles.dangerBtn} onClick={executeDeletePatient}>Remove Profile</button>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
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
            <p className={styles.deleteNote}>This will permanently delete the record and storage file.</p>
            <div className={styles.modalFooter}>
              <button className={styles.dangerBtn} onClick={executeDeleteRx}>Delete Prescription</button>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Vault Attribution Modal */}
      {modal === 'adminAttribution' && isAdminRole && (
        <Modal title="Admin Vault Attribution Breakdown" onClose={closeModal} wide>
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '16px' }}>
              Full account hierarchy showing user accounts, managed family members, and prescription upload attribution.
            </p>

            {loadingAttribution ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>Loading attribution records...</div>
            ) : attributionData.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>No vault accounts found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
                {attributionData.map(acc => (
                  <div key={acc.accountId} style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>👤 Account #{acc.accountId}: {acc.accountName}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginLeft: '8px' }}>({acc.accountEmail})</span>
                      </div>
                      <span className="badge badge-teal">{acc.familyMembers?.length || 0} Members</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '12px', borderLeft: '2px solid var(--teal-500)' }}>
                      {(acc.familyMembers || []).map(m => (
                        <div key={m.memberId} style={{ background: 'white', border: '1px solid var(--slate-200)', borderRadius: '8px', padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '0.9rem' }}>{m.memberName} ({m.relation})</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Member ID: {m.memberId}</span>
                          </div>

                          {m.prescriptions?.length === 0 ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>No prescriptions uploaded</span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                              {m.prescriptions.map(p => (
                                <div key={p.prescriptionId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--slate-50)', borderRadius: '6px', fontSize: '0.8rem' }}>
                                  <div>
                                    <strong>{p.title}</strong>
                                    <span style={{ marginLeft: '8px', color: 'var(--slate-500)' }}>
                                      Uploaded by: <strong>{p.uploadedBy?.userName || 'Owner'}</strong> (ID: {p.uploadedBy?.userId})
                                    </span>
                                  </div>
                                  <span className={`badge ${p.status === 'VERIFIED' ? 'badge-green' : p.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}`}>
                                    {p.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
}
