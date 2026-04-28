import { useState, useEffect, useCallback, useRef } from 'react';
import MedicineCard from '@/components/MedicineCard';
import styles from './MedicinesPage.module.css';
import { AlertTriangle, Sparkles, Pill, Search, X } from 'lucide-react';


const ITEMS_PER_PAGE = 12;

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

  // Debounce timer ref
  const debounceRef = useRef(null);

  // ── Fetch from static JSON ──────────────────────────────────────────────────
  const fetchMedicines = useCallback(async (q, category, sort, page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/medicines.json');
      if (!res.ok) throw new Error('Failed to fetch medicines');
      let results = await res.json();

      const query = q?.toLowerCase().trim() || '';
      
      if (query) {
        results = results.filter(
          (med) =>
            med.name.toLowerCase().includes(query) ||
            med.salt.toLowerCase().includes(query) ||
            med.manufacturer.toLowerCase().includes(query)
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounced search / immediate filter changes ───────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Only debounce the text search; category/sort changes are instant
    const delay = query !== '' ? 300 : 0;

    debounceRef.current = setTimeout(() => {
      fetchMedicines(query, activeCategory, sortBy, currentPage);
    }, delay);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory, sortBy, currentPage]);

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

  // ── Pagination: page numbers with ellipsis ────────────────────────────────
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
          <p>Browse 400+ medicines from licensed pharmacies near you</p>
        </div>

        {/* Search */}
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}><Search size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></span>
          <input
            type="text"
            placeholder="Search by medicine name, salt, or manufacturer..."
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
              ? 'Loading…'
              : error
              ? `Error: ${error}`
              : `Showing ${total > 0 ? startIndex + 1 : 0}–${Math.min(startIndex + ITEMS_PER_PAGE, total)} of ${total} medicines`}
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
