import { Show, SignInButton, SignUpButton } from '@clerk/react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';
import { 
  Home, ShoppingBag, TestTubes, RefreshCw, Folder, Info, ShoppingCart, 
  User, Settings, LogOut, Key, Package, BarChart3, Shield, Hospital, Bike, 
  X, MapPin, ChevronDown, Sparkles, CheckCircle2, Tag, ArrowRight 
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/',             icon: <Home size={17} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Home' },
  { href: '/medicines',    icon: <ShoppingBag size={17} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Shop' },
  { href: '/salt-compare', icon: <TestTubes size={17} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Salt Comparison' },
  { href: '/subscription', icon: <RefreshCw size={17} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Auto Refill' },
  { href: '/prescriptions',icon: <Folder size={17} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Prescriptions' },
];

const CITIES = [
  'Bengaluru 560001',
  'Mumbai 400001',
  'Delhi 110001',
  'Hyderabad 500001',
  'Chennai 600001',
  'Kolkata 700001',
  'Pune 411001'
];

export default function Header() {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState('Bengaluru 560001');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const menuRef = useRef(null);
  const locationRef = useRef(null);

  const isAuthPage = ['/login', '/login/', '/sign-in', '/sign-in/', '/signup', '/signup/'].includes(pathname.toLowerCase());

  // Simplified nav links for auth page
  const displayNavLinks = isAuthPage
    ? [
        { href: '/',      icon: <Home size={17} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'Home' },
        { href: '/about', icon: <Info size={17} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />, label: 'About & Contact' },
      ]
    : NAV_LINKS;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationOpen(false);
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
    if (role === 'super_admin') return <span className={styles.roleBadgeSuper}>SUPER ADMIN</span>;
    if (role === 'admin') return <span className={styles.roleBadgeAdmin}>ADMIN</span>;
    if (role === 'pharmacy') return <span className={styles.roleBadgePharma}>PHARMACY</span>;
    if (role === 'rider') return <span className={styles.roleBadgeRider}>RIDER</span>;
    return <span className={styles.roleBadgePatient}>PATIENT</span>;
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
        {/* TOP MAIN HEADER BAR */}
        <div className={styles.mainHeader}>
          <div className={styles.container}>
            
            {/* Logo */}
            <Link to="/" className={styles.logo}>
              <div className={styles.logoIconBg}>
                <span className={styles.logoIcon}>+</span>
              </div>
              <span className={styles.logoText}>MediFly</span>
            </Link>

            {/* Location Selector Pill */}
            {!isAuthPage && (
              <div className={styles.locationWrap} ref={locationRef}>
                <button 
                  className={styles.locationBtn} 
                  onClick={() => setLocationOpen(!locationOpen)}
                  aria-label="Select delivery location"
                >
                  <div className={styles.locationPinIconWrap}>
                    <MapPin size={16} className={styles.locationPinIcon} />
                  </div>
                  <div className={styles.locationDetails}>
                    <span className={styles.locationLabel}>Select location</span>
                    <span className={styles.locationCity}>
                      {currentCity.split(' ')[0]} <ChevronDown size={13} className={styles.chevron} />
                    </span>
                  </div>
                </button>

                {locationOpen && (
                  <div className={styles.locationDropdown}>
                    <div className={styles.locationDropdownHeader}>Delivery Location (India)</div>
                    {CITIES.map((city) => (
                      <button 
                        key={city}
                        className={`${styles.locationOption} ${currentCity === city ? styles.activeCity : ''}`}
                        onClick={() => {
                          setCurrentCity(city);
                          setLocationOpen(false);
                        }}
                      >
                        <MapPin size={14} />
                        <span>{city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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

              {/* Quick role portal links */}
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <Link to="/admin" className={`${styles.navLink} ${pathname === '/admin' ? styles.active : ''}`} style={{ color: '#dc2626' }}>
                  <Shield size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px' }} /> Admin Portal
                </Link>
              )}
              {user?.role === 'pharmacy' && (
                <Link to="/pharmacy" className={`${styles.navLink} ${pathname === '/pharmacy' ? styles.active : ''}`} style={{ color: '#4f46e5' }}>
                  <Hospital size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px' }} /> Pharmacy Portal
                </Link>
              )}
              {user?.role === 'rider' && (
                <Link to="/rider" className={`${styles.navLink} ${pathname === '/rider' ? styles.active : ''}`} style={{ color: '#d97706' }}>
                  <Bike size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px' }} /> Fleet Portal
                </Link>
              )}
            </nav>

            {/* Actions (Cart & User Account Pill) */}
            <div className={styles.actions}>
              
              {/* Cart Button */}
              {!isAuthPage && (
                <button className={styles.cartIconBtn} onClick={() => setIsOpen(true)} aria-label="Open cart">
                  <ShoppingCart size={19} />
                  {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
                </button>
              )}

              {/* Clerk Auth Controls */}
              {!isAuthPage && !user && (
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className={styles.btnSignIn}>Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className={styles.btnSignUp}>Sign Up</button>
                  </SignUpButton>
                </Show>
              )}

              {/* User Account Pill (Matches Jacob Jones Pill in Reference) */}
              {user && (
                <div className={styles.userMenuWrap} ref={menuRef}>
                  <button
                    className={styles.userPillBtn}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    id="user-menu-btn"
                    aria-label="User account menu"
                  >
                    <div className={styles.userAvatarIcon}>
                      <User size={16} />
                    </div>
                    <div className={styles.userPillMeta}>
                      <span className={styles.userPillGreeting}>Hello!</span>
                      <span className={styles.userPillName}>
                        {user.name?.split(' ')[0] || 'My Account'}
                      </span>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className={styles.userDropdown}>
                      <div className={styles.dropdownHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <strong>{user.name}</strong>
                          {getRoleBadge(user.role)}
                        </div>
                        <span className={styles.dropdownRole}>{user.email ? user.email.toLowerCase() : user.phone}</span>
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

              {/* Hamburger Button (Mobile) */}
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
        </div>

        {/* SUB-HEADER QUICK CATEGORY PILLS BAR (FROM REFERENCE IMAGE) */}
        {!isAuthPage && (
          <div className={styles.subHeader}>
            <div className={styles.subContainer}>
              <div className={styles.categoryPills}>
                <Link to="/medicines" className={`${styles.catPill} ${styles.catPillPrimary}`}>
                  Shop by Categories
                </Link>
                <Link to="/medicines?sort=price-low" className={styles.catPill}>
                  Under ₹500
                </Link>
                <Link to="/medicines?sort=name-desc" className={styles.catPill}>
                  <Sparkles size={13} className={styles.catPillIcon} /> New Arrivals
                </Link>
                <Link to="/medicines" className={styles.catPill}>
                  <CheckCircle2 size={13} className={styles.catPillIcon} /> Best Selling
                </Link>
                <Link to="/medicines" className={styles.catPill}>
                  <Tag size={13} className={styles.catPillIcon} /> New Offer
                </Link>
                <Link to="/medicines?category=pain-relief" className={styles.catPill}>
                  Personal Care
                </Link>
                <Link to="/medicines?category=supplement" className={styles.catPill}>
                  Vitamins & Supplements
                </Link>
                <Link to="/medicines?category=diabetes" className={styles.catPill}>
                  Diabetes Care
                </Link>
              </div>

              <Link to="/medicines" className={styles.subArrowCircle} title="Browse All Products" aria-label="Browse All Products">
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
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
