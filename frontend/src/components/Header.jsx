import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';
import { Home, ShoppingBag, TestTubes, RefreshCw, Folder, Info, Phone, ShoppingCart, User, Settings, LogOut, Key, Package, BarChart3, X } from 'lucide-react';


const NAV_LINKS = [
  { href: '/',             icon: <Home size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Home' },
  { href: '/medicines',    icon: <ShoppingBag size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Shop' },
  { href: '/salt-compare', icon: <TestTubes size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Salt Comparison' },
  { href: '/subscription', icon: <RefreshCw size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Auto Refill' },
  { href: '/prescriptions',icon: <Folder size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Prescription Vault' },
  { href: '/about',        icon: <Info size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'About' },
  { href: '/contact',      icon: <Phone size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Contact' },
];

export default function Header() {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
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
    navigate('/');
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
            {NAV_LINKS.map(({ href, icon, label }) => (
              <Link
                key={href}
                to={href}
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
              <ShoppingCart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
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
                <User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
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
                      <Link to="/profile"   className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}><User size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> My Profile</Link>
                      <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}><BarChart3 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Dashboard</Link>
                      <Link to="/orders"    className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}><Package size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> My Orders</Link>
                      <Link to="/settings"  className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}><Settings size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Settings</Link>
                      <div className={styles.dropdownDivider}></div>
                      <button className={styles.dropdownLogout} onClick={handleLogout}><LogOut size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Logout</button>
                    </>
                  ) : (
                    <>
                      <div className={styles.dropdownHeader}>
                        <strong>Welcome to MediFly</strong>
                        <span className={styles.dropdownRole}>Sign in to continue</span>
                      </div>
                      <div className={styles.dropdownDivider}></div>
                      <Link to="/login" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}><Key size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Login / Register</Link>
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
          <Link to="/" className={styles.logo} onClick={() => setMobileOpen(false)}>
            <div className={styles.logoIconBg}>
              <span className={styles.logoIcon}>+</span>
            </div>
            <span className={styles.logoText}>MediFly</span>
          </Link>
          <button className={styles.mobileClose} onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /></button>
        </div>

        <div className={styles.mobileNavLinks}>
          {NAV_LINKS.map(({ href, icon, label }) => (
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
        </div>

        <div className={styles.mobileNavFooter}>
          <button
            className={`btn btn-primary ${styles.mobileCartBtn}`}
            onClick={() => { setIsOpen(true); setMobileOpen(false); }}
          >
            <ShoppingCart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> View Cart {totalItems > 0 && <span className={styles.mobileCartCount}>{totalItems}</span>}
          </button>
          {!user && (
            <Link to="/login" className={`btn btn-outline ${styles.mobileLoginBtn}`} onClick={() => setMobileOpen(false)}>
              <Key size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Login / Register
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
