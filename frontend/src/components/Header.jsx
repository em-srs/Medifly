import { Show, SignInButton, SignUpButton } from '@clerk/react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';
import { Home, ShoppingBag, TestTubes, RefreshCw, Folder, Info, Phone, ShoppingCart, User, Settings, LogOut, Key, Package, BarChart3, Shield, Hospital, Bike, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',             icon: <Home size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Home' },
  { href: '/medicines',    icon: <ShoppingBag size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Shop' },
  { href: '/salt-compare', icon: <TestTubes size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Salt Comparison' },
  { href: '/subscription', icon: <RefreshCw size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Auto Refill' },
  { href: '/prescriptions',icon: <Folder size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Prescription Vault' },
];

export default function Header() {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  const isAuthPage = ['/login', '/login/', '/sign-in', '/sign-in/', '/signup', '/signup/'].includes(pathname.toLowerCase());

  // Simplified pre-auth nav links for auth page
  const displayNavLinks = isAuthPage
    ? [
        { href: '/',             icon: <Home size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Home' },
        { href: '/about',        icon: <Info size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'About & Contact' },
      ]
    : NAV_LINKS;

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
    navigate('/');
  };

  const getRoleBadge = (role) => {
    if (role === 'super_admin') return <span style={{ background: '#f3e8ff', color: '#6b21a8', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>SUPER ADMIN</span>;
    if (role === 'admin') return <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>ADMIN</span>;
    if (role === 'pharmacy') return <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>PHARMACY</span>;
    if (role === 'rider') return <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>RIDER</span>;
    return <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>PATIENT</span>;
  };

  const getRoleDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'admin' || user.role === 'super_admin') return '/admin';
    if (user.role === 'pharmacy') return '/pharmacy';
    if (user.role === 'rider') return '/rider';
    return '/dashboard';
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIconBg}>
              <span className={styles.logoIcon}>+</span>
              <span className={styles.logoShield}></span>
            </div>
            <span className={styles.logoText}>MediFly</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {displayNavLinks.map(({ href, icon, label }) => (
              <Link
                key={href}
                to={href}
                className={`${styles.navLink} ${pathname === href ? styles.active : ''}`}
              >
                <span>{icon}</span> {label}
              </Link>
            ))}

            {/* Quick role-specific navigation portal links */}
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Link to="/admin" className={`${styles.navLink} ${pathname === '/admin' ? styles.active : ''}`} style={{ color: '#dc2626', fontWeight: 600 }}>
                <Shield size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px' }} /> Admin Portal
              </Link>
            )}
            {user?.role === 'pharmacy' && (
              <Link to="/pharmacy" className={`${styles.navLink} ${pathname === '/pharmacy' ? styles.active : ''}`} style={{ color: '#4f46e5', fontWeight: 600 }}>
                <Hospital size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px' }} /> Pharmacy Portal
              </Link>
            )}
            {user?.role === 'rider' && (
              <Link to="/rider" className={`${styles.navLink} ${pathname === '/rider' ? styles.active : ''}`} style={{ color: '#d97706', fontWeight: 600 }}>
                <Bike size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px' }} /> Fleet Portal
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Cart - visible on all pages except auth pages */}
            {!isAuthPage && (
              <button className={styles.iconBtn} onClick={() => setIsOpen(true)} aria-label="Open cart">
                <ShoppingCart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
              </button>
            )}

            {/* Clerk Authentication Controls - hidden on /login page */}
            {!isAuthPage && (
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Sign Up</button>
                </SignUpButton>
              </Show>
            )}

            {/* Single User Account Dropdown Menu - shown when authenticated */}
            {user && (
              <div className={styles.userMenuWrap} ref={menuRef}>
                <button
                  className={`${styles.iconBtn} ${user ? styles.userLoggedIn : ''}`}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  id="user-menu-btn"
                  aria-label="User menu"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.75rem', borderRadius: '20px' }}
                >
                  <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    {user.name?.split(' ')[0] || 'Account'}
                  </span>
                  {user && <span className={styles.userDot}></span>}
                </button>

                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong>{user.name}</strong>
                        {getRoleBadge(user.role)}
                      </div>
                      <span className={styles.dropdownRole}>{user.email || user.phone}</span>
                    </div>
                    <div className={styles.dropdownDivider}></div>
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <User size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> Profile
                    </Link>
                    <Link to={getRoleDashboardLink()} className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <BarChart3 size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> Portal Dashboard
                    </Link>
                    <Link to="/orders" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <Package size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> My Orders
                    </Link>
                    <Link to="/settings" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <Settings size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> Settings
                    </Link>
                    <div className={styles.dropdownDivider}></div>
                    <button className={styles.dropdownLogout} onClick={handleLogout}>
                      <LogOut size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

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
          <Link to="/" className={styles.logo} onClick={() => setMobileOpen(false)}>
            <div className={styles.logoIconBg}>
              <span className={styles.logoIcon}>+</span>
            </div>
            <span className={styles.logoText}>MediFly</span>
          </Link>
          <button className={styles.mobileClose} onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>

        <div className={styles.mobileNavLinks}>
          {displayNavLinks.map(({ href, icon, label }) => (
            <Link
              key={href}
              to={href}
              className={`${styles.mobileNavLink} ${pathname === href ? styles.mobileNavActive : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.mobileNavIcon}>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}

          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link to="/admin" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)} style={{ color: '#dc2626' }}>
              <span className={styles.mobileNavIcon}><Shield size={18} /></span>
              <span>Admin Portal</span>
            </Link>
          )}
          {user?.role === 'pharmacy' && (
            <Link to="/pharmacy" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)} style={{ color: '#4f46e5' }}>
              <span className={styles.mobileNavIcon}><Hospital size={18} /></span>
              <span>Pharmacy Portal</span>
            </Link>
          )}
          {user?.role === 'rider' && (
            <Link to="/rider" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)} style={{ color: '#d97706' }}>
              <span className={styles.mobileNavIcon}><Bike size={18} /></span>
              <span>Fleet Portal</span>
            </Link>
          )}
        </div>

        <div className={styles.mobileNavFooter}>
          <button
            className={`btn btn-primary ${styles.mobileCartBtn}`}
            onClick={() => { setIsOpen(true); setMobileOpen(false); }}
          >
            <ShoppingCart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> View Cart {totalItems > 0 && <span className={styles.mobileCartCount}>{totalItems}</span>}
          </button>
          {!user ? (
            <Link to="/login" className={`btn btn-outline ${styles.mobileLoginBtn}`} onClick={() => setMobileOpen(false)}>
              <Key size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Login / Register
            </Link>
          ) : (
            <button className={`btn btn-outline ${styles.mobileLoginBtn}`} onClick={handleLogout}>
              <LogOut size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Logout ({user.name})
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
