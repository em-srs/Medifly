import { useState, useEffect, useCallback, useRef } from 'react';
import MedicineCard from '@/components/MedicineCard';
import styles from './MedicinesPage.module.css';
import { AlertTriangle, Sparkles, Pill, Search, X, Database } from 'lucide-react';

const ITEMS_PER_PAGE = 12;
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const CATEGORIES = [
  { id: 'all',         label: 'All Medicines',   icon: <Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> },
  { id: 'pain-relief', label: 'Pain Relief',      icon: '🤕' },
  { id: 'antibiotic',  label: 'Antibiotics',      icon: '🦠' },
  { id: 'diabetes',    label: 'Diabetes Care',    icon: '🩸' },
  { id: 'cardiac',     label: 'Heart Care',       icon: '❤️' },
  { id: 'allergy',     label: 'Allergy',          icon: '🤧' },
  { id: 'respiratory', label: 'Respiratory',      icon: '🫁' },
  { id: 'gastro',      label: 'Stomach Care',     icon: '🫃' },
  { id: 'cold-flu',    label: 'Cold & Flu',       icon: '🤒' },
  { id: 'supplement',  label: 'Supplements',      icon: <Sparkles size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> },
  { id: 'hormones',    label: 'Hormones',         icon: '🎭' },
];

export default function MedicinesPage() {
  const [query,          setQuery]          = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy,         setSortBy]         = useState('name');
  const [currentPage,    setCurrentPage]    = useState(1);

  // API response state
  const [items,       setItems]       = useState([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [isLiveDb,    setIsLiveDb]    = useState(false);

  // Debounce timer ref
  const debounceRef = useRef(null);

  // ── Fetch from PostgreSQL Backend API ──────────────────────────────────────
  const fetchMedicines = useCallback(async (q, category, sort, page) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/api/medicines?pageNumber=${page}&pageSize=${ITEMS_PER_PAGE}&sort=${sort}`;
      if (q) {
        url += `&keyword=${encodeURIComponent(q)}`;
      }
      if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let results = data.medicines || [];

        setItems(results.map(med => ({
          ...med,
          id: med._id || med.id,
          name: med.brandName || med.name,
          brandName: med.brandName || med.name,
          salt: med.genericName || med.saltComposition?.saltName || med.salt || 'General Chemical Salt',
          price: parseFloat(med.price),
          manufacturer: med.manufacturer || 'Licensed Partner Pharma',
          requiresPrescription: med.requiresPrescription || false,
          coldChainRequired: med.coldChainRequired || false,
          image: med.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'
        })));
        setTotal(data.totalCount !== undefined ? data.totalCount : results.length);
        setTotalPages(data.pages || 1);
        setIsLiveDb(true);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend fetch fallback to static file:', err.message);
    }

    // Fallback to static JSON if backend is offline
    try {
      setIsLiveDb(false);
      const res = await fetch('/medicines.json');
      let results = await res.json();
      const searchQuery = q?.toLowerCase().trim() || '';

      if (searchQuery) {
        results = results.filter(
          (med) =>
            med.name.toLowerCase().includes(searchQuery) ||
            med.salt.toLowerCase().includes(searchQuery) ||
            med.manufacturer.toLowerCase().includes(searchQuery)
        );
      } else if (category && category !== 'all') {
        results = results.filter((med) => med.category === category);
      }

      if (sort === 'price-low')       results.sort((a, b) => a.price - b.price);
      else if (sort === 'price-high') results.sort((a, b) => b.price - a.price);
      else                            results.sort((a, b) => a.name.localeCompare(b.name));

      const totalItems = results.length;
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const paginatedItems = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      setItems(paginatedItems);
      setTotal(totalItems);
      setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
    } catch (fallbackErr) {
      setError(fallbackErr.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounced search / filter changes ──────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = query !== '' ? 300 : 0;

    debounceRef.current = setTimeout(() => {
      fetchMedicines(query, activeCategory, sortBy, currentPage);
    }, delay);

    return () => clearTimeout(debounceRef.current);
  }, [query, activeCategory, sortBy, currentPage, fetchMedicines]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    setQuery(e.target.value);
    if (e.target.value) setActiveCategory('all');
    setCurrentPage(1);
  };

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setQuery('');
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end   = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <h1>Order Medicines</h1>
          <p>
            Browse 250,000+ medicines from licensed pharmacies in PostgreSQL database{' '}
            {isLiveDb && (
              <span style={{ fontSize: '0.8rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, marginLeft: '6px' }}>
                <Database size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Live Supabase PostgreSQL
              </span>
            )}
          </p>
        </div>

        {/* Search */}
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}><Search size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
          <input
            type="text"
            placeholder="Search 250,000+ medicines by brand name, salt, or manufacturer..."
            value={query}
            onChange={handleSearch}
            className={styles.searchInput}
            id="medicine-search"
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => { setQuery(''); setCurrentPage(1); }}><X size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
          )}
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.categories}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`${styles.catBtn} ${activeCategory === cat.id && !query ? styles.catActive : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={handleSortChange}
            id="sort-select"
          >
            <option value="name">Sort: A–Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Results count */}
        <div className={styles.results}>
          <span className={styles.resultCount}>
            {loading
              ? 'Querying PostgreSQL Database…'
              : error
              ? `Error: ${error}`
              : `Showing ${total > 0 ? startIndex + 1 : 0}–${Math.min(startIndex + ITEMS_PER_PAGE, total)} of ${total.toLocaleString()} medicines`}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon"><AlertTriangle size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        ) : items.length > 0 ? (
          <div className={styles.grid}>
            {items.map((med) => (
              <MedicineCard key={med.id} medicine={med} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><Pill size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></div>
            <h3>No medicines found</h3>
            <p>Try a different search term or browse by category.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={`${styles.pageBtn} ${styles.pageNavBtn}`}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>

            <div className={styles.pageNumbers}>
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className={styles.pageEllipsis}>…</span>
                ) : (
                  <button
                    key={page}
                    className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              className={`${styles.pageBtn} ${styles.pageNavBtn}`}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
