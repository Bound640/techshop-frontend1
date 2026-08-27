// ============================================================
// TechShop - Barre de navigation (avec authentification)
// Fichier : src/components/Navbar.js
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, estConnecte, estAdmin, deconnecter } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const inputRef  = useRef(null);
  const userMenuRef = useRef(null);

  // Ombre au scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fermer le menu mobile au changement de route
  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location]);

  // Fermer le menu utilisateur au clic extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produits?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    deconnecter();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Tech<strong>Shop</strong></span>
        </Link>

        {/* Navigation desktop */}
        <nav className="navbar__nav">
          <Link to="/"         className={isActive('/')}>Accueil</Link>
          <Link to="/produits" className={isActive('/produits')}>Catalogue</Link>
          {estAdmin && (
            <Link to="/admin" className={isActive('/admin')}>📊 Admin</Link>
          )}
        </nav>

        {/* Barre de recherche */}
        <form className="navbar__search" onSubmit={handleSearch}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Recherche"
          />
          <button type="submit" aria-label="Lancer la recherche">🔍</button>
        </form>

        {/* Actions */}
        <div className="navbar__actions">

          {/* Panier */}
          <Link to="/panier" className="cart-btn" aria-label="Panier">
            <span className="cart-icon">🛒</span>
            {totalItems > 0 && (
              <span className="cart-badge" key={totalItems}>{totalItems}</span>
            )}
          </Link>

          {/* Auth : connecté ou non */}
          {estConnecte ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="user-btn"
                onClick={() => setUserMenuOpen(o => !o)}
                aria-label="Menu utilisateur"
              >
                <span className="user-avatar">{user.prenom?.[0]?.toUpperCase()}</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown fade-in">
                  <div className="user-dropdown__header">
                    <span className="user-avatar user-avatar--lg">{user.prenom?.[0]?.toUpperCase()}</span>
                    <div>
                      <p className="user-name">{user.prenom} {user.nom}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  {estAdmin && (
                    <span className="user-role-badge">👑 Administrateur</span>
                  )}
                  <div className="user-dropdown__links">
                    {estAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}>📊 Tableau de bord</Link>
                    )}
                    <Link to="/mes-commandes" onClick={() => setUserMenuOpen(false)}>📦 Mes commandes</Link>
                  </div>
                  <button className="user-logout-btn" onClick={handleLogout}>
                    🚪 Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/connexion" className="btn btn-primary btn-sm auth-nav-btn">
              Connexion
            </Link>
          )}
        </div>

        {/* Burger mobile */}
        <button
          className={`burger${menuOpen ? ' burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu mobile"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Menu mobile */}
      <div className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`}>
        <Link to="/"         className="mobile-link">🏠 Accueil</Link>
        <Link to="/produits" className="mobile-link">🛍️ Catalogue</Link>
        <Link to="/panier"   className="mobile-link">🛒 Panier {totalItems > 0 && `(${totalItems})`}</Link>

        {estConnecte ? (
          <>
            {estAdmin && <Link to="/admin" className="mobile-link">📊 Tableau de bord</Link>}
            <Link to="/mes-commandes" className="mobile-link">📦 Mes commandes</Link>
            <button className="mobile-link mobile-logout" onClick={handleLogout}>
              🚪 Se déconnecter ({user.prenom})
            </button>
          </>
        ) : (
          <>
            <Link to="/connexion"   className="mobile-link">🔑 Connexion</Link>
            <Link to="/inscription" className="mobile-link">📝 Créer un compte</Link>
          </>
        )}

        <form className="mobile-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
      </div>
    </header>
  );
};

export default Navbar;
