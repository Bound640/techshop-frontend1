// ============================================================
// TechShop - Page d'accueil
// Fichier : src/pages/Home.js
// ============================================================

import { useNavigate } from 'react-router-dom';
import { categories, getFeaturedProducts } from '../data/products';
import { formatPrice, SEUIL_LIVRAISON_GRATUITE } from '../utils/formatPrice';
import ProductCard from '../components/ProductCard';
import './Home.css';

const advantages = [
  { icon: '🚚', title: 'Livraison gratuite', desc: `Dès ${formatPrice(SEUIL_LIVRAISON_GRATUITE)} d'achat` },
  { icon: '🔒', title: 'Paiement sécurisé',  desc: 'Cryptage SSL 256 bits' },
  { icon: '↩️',  title: 'Retour 30 jours',   desc: 'Remboursement garanti' },
  { icon: '🎧', title: 'Support 24/7',        desc: 'Toujours à votre écoute' },
];

const Home = () => {
  const navigate  = useNavigate();
  const featured  = getFeaturedProducts();

  return (
    <main className="home">

      {/* ---- Hero ------------------------------------------- */}
      <section className="hero">
        <div className="hero__content container">
          <div className="hero__text fade-in">
            <span className="hero__tag">🔥 Nouveautés 2025</span>
            <h1>La technologie<br /><span>à portée de main</span></h1>
            <p>
              Découvrez notre sélection de smartphones, ordinateurs, casques et montres
              connectées. Les meilleures marques aux prix les plus compétitifs.
            </p>
            <div className="hero__btns">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/produits')}>
                🛍️ Voir le catalogue
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/produits?cat=smartphones')}>
                Smartphones →
              </button>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__float-card hero__float-card--1">📱 +24% ventes</div>
            <div className="hero__float-card hero__float-card--2">⭐ Note 4.8/5</div>
            <img
              src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80"
              alt="Produits technologiques"
            />
          </div>
        </div>
      </section>

      {/* ---- Avantages -------------------------------------- */}
      <section className="advantages">
        <div className="container advantages__grid">
          {advantages.map(a => (
            <div className="advantage-card" key={a.title}>
              <span className="advantage-icon">{a.icon}</span>
              <div>
                <h4>{a.title}</h4>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Catégories ------------------------------------- */}
      <section className="section-categories container">
        <div className="section-title">
          <h2>Nos Catégories</h2>
          <p>Trouvez rapidement ce que vous cherchez</p>
          <div className="title-underline" />
        </div>
        <div className="categories-grid">
          {categories.map(cat => (
            <button
              key={cat.id}
              className="category-card"
              style={{ '--cat-color': cat.color }}
              onClick={() => navigate(`/produits?cat=${cat.id}`)}
            >
              <span className="category-card__icon">{cat.icon}</span>
              <span className="category-card__label">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ---- Produits vedettes ------------------------------ */}
      <section className="section-featured container">
        <div className="section-title">
          <h2>Produits Vedettes</h2>
          <p>Notre sélection des meilleurs articles du moment</p>
          <div className="title-underline" />
        </div>
        <div className="products-grid">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="section-cta">
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/produits')}>
            Voir tous les produits →
          </button>
        </div>
      </section>

      {/* ---- Bannière promo --------------------------------- */}
      <section className="promo-banner">
        <div className="container promo-banner__inner">
          <div>
            <h2>🎯 Livraison offerte dès {formatPrice(SEUIL_LIVRAISON_GRATUITE)}</h2>
            <p>Profitez de la livraison gratuite sur toutes vos commandes de plus de {formatPrice(SEUIL_LIVRAISON_GRATUITE)}.</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/produits')}>
            J'en profite
          </button>
        </div>
      </section>

    </main>
  );
};

export default Home;
