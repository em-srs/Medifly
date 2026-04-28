'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

const NAV_LINKS = [
  { href: '/',             icon: '🏠', label: 'Home' },
  { href: '/medicines',    icon: '🛍️', label: 'Shop' },
  { href: '/salt-compare', icon: '🔬', label: 'Salt Comparison' },
  { href: '/subscription', icon: '🔄', label: 'Auto Refill' },
  { href: '/prescriptions',icon: '📁', label: 'Prescription Vault' },
  { href: '/about',        icon: 'ℹ️', label: 'About' },
  { href: '/contact',      icon: '📞', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIconBg}>
              <span className={styles.logoIcon}>+</span>
              <span className={styles.logoShield}></span>
            </div>
            <span className={styles.logoText}>MediFly</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {NAV_LINKS.map(({ href, icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${pathname === href ? styles.active : ''}`}
              >
                <span>{icon}</span> {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Cart */}
            <button className={styles.iconBtn} onClick={() => setIsOpen(true)} aria-label="Open cart">
              🛒
              {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
            </button>

            {/* User Menu */}
            <div className={styles.userMenuWrap} ref={menuRef}>
              <button
                className={`${styles.iconBtn} ${user ? styles.userLoggedIn : ''}`}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                id="user-menu-btn"
                aria-label="User menu"
              >
                👤
                {user && <span className={styles.userDot}></span>}
              </button>

              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  {user ? (
                    <>
                      <div className={styles.dropdownHeader}>
                        <strong>{user.name}</strong>
                        <span className={styles.dropdownRole}>{user.role}</span>
                      </div>
                      <div className={styles.dropdownDivider}></div>
                      <Link href="/profile"   className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>👤 My Profile</Link>
                      <Link href="/dashboard" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>📊 Dashboard</Link>
                      <Link href="/orders"    className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>📦 My Orders</Link>
                      <Link href="/settings"  className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>⚙️ Settings</Link>
                      <div className={styles.dropdownDivider}></div>
                      <button className={styles.dropdownLogout} onClick={handleLogout}>🚪 Logout</button>
                    </>
                  ) : (
                    <>
                      <div className={styles.dropdownHeader}>
                        <strong>Welcome to MediFly</strong>
                        <span className={styles.dropdownRole}>Sign in to continue</span>
                      </div>
                      <div className={styles.dropdownDivider}></div>
                      <Link href="/login" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>🔑 Login / Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span className={`${styles.hbar} ${mobileOpen ? styles.hbar1Open : ''}`} />
              <span className={`${styles.hbar} ${mobileOpen ? styles.hbar2Open : ''}`} />
              <span className={`${styles.hbar} ${mobileOpen ? styles.hbar3Open : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <div className={`${styles.mobileBackdrop} ${mobileOpen ? styles.mobileBackdropOpen : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <nav className={`${styles.mobileNav} ${mobileOpen ? styles.mobileNavOpen : ''}`} aria-label="Mobile navigation">
        <div className={styles.mobileNavHeader}>
          <Link href="/" className={styles.logo} onClick={() => setMobileOpen(false)}>
            <div className={styles.logoIconBg}>
              <span className={styles.logoIcon}>+</span>
            </div>
            <span className={styles.logoText}>MediFly</span>
          </Link>
          <button className={styles.mobileClose} onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
        </div>

        <div className={styles.mobileNavLinks}>
          {NAV_LINKS.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.mobileNavLink} ${pathname === href ? styles.mobileNavActive : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.mobileNavIcon}>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className={styles.mobileNavFooter}>
          <button
            className={`btn btn-primary ${styles.mobileCartBtn}`}
            onClick={() => { setIsOpen(true); setMobileOpen(false); }}
          >
            🛒 View Cart {totalItems > 0 && <span className={styles.mobileCartCount}>{totalItems}</span>}
          </button>
          {!user && (
            <Link href="/login" className={`btn btn-outline ${styles.mobileLoginBtn}`} onClick={() => setMobileOpen(false)}>
              🔑 Login / Register
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
