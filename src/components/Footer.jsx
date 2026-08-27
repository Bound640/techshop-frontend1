// ============================================================
// TechShop - Pied de page
// Fichier : src/components/Footer.js
// ============================================================

import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__grid">

        {/* Marque */}
        <div className="footer__brand">
          <div className="footer__logo">⚡ <strong>Tech</strong>Shop</div>
          <p>Votre destination technologique. Les meilleurs produits high-tech au meilleur prix, livrés rapidement.</p>
          <div className="footer__social">
            <a href="#top" aria-label="Facebook"  className="social-btn">📘</a>
            <a href="#top" aria-label="Twitter"   className="social-btn">🐦</a>
            <a href="#top" aria-label="Instagram" className="social-btn">📸</a>
          </div>
        </div>

        {/* Liens */}
        <div className="footer__col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/produits">Catalogue</Link></li>
            <li><Link to="/panier">Panier</Link></li>
          </ul>
        </div>

        {/* Catégories */}
        <div className="footer__col">
          <h4>Catégories</h4>
          <ul>
            <li><Link to="/produits?cat=smartphones">Smartphones</Link></li>
            <li><Link to="/produits?cat=ordinateurs">Ordinateurs</Link></li>
            <li><Link to="/produits?cat=casques">Casques Audio</Link></li>
            <li><Link to="/produits?cat=montres">Montres Connectées</Link></li>
            <li><Link to="/produits?cat=appareils-photo">Appareils Photo</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer__col">
          <h4>Contact</h4>
          <ul className="footer__contact">
            <li>📍 ISEP de Thiès, Sénégal</li>
            <li>📞 +221 33 929 26 08</li>
            <li>✉️ techshop@isep-thies.sn</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} TechShop — ISEP de Thiès | DWM Promotion 13</p>
          <p>Réalisé par Boundia NDAO, Moussa Kanté, Alfousseynou Diaw, Fatoumata Coumba Diaby, Samba Bocar Ba</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
