// ============================================================
// TechShop - Fiche produit détaillée
// Fichier : src/pages/ProductDetail.js
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatPrice, SEUIL_LIVRAISON_GRATUITE } from '../utils/formatPrice';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

const ProductDetail = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const product   = getProductById(id);

  const { addToCart, isInCart, getItemQty } = useCart();
  const [qty, setQty]         = useState(1);
  const [toast, setToast]     = useState('');
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!product) {
    return (
      <div className="container empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="icon">🔍</div>
        <h3>Produit introuvable</h3>
        <p>Ce produit n'existe pas ou a été retiré du catalogue.</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/produits')}>
          Retour au catalogue
        </button>
      </div>
    );
  }

  const related = getRelatedProducts(product);
  const inCart  = isInCart(product.id);
  const cartQty = getItemQty(product.id);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setToast(`✅ ${qty} × ${product.name} ajouté${qty > 1 ? 's' : ''} au panier !`);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div className="product-detail container">

      {/* Fil d'Ariane */}
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link>
        <span>/</span>
        <Link to="/produits">Catalogue</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      {/* ---- Bloc principal --------------------------------- */}
      <div className="detail-main">

        {/* Image */}
        <div className="detail-img">
          <img src={product.image} alt={product.name} />
          {product.badge && (
            <span className={`badge badge-blue detail-badge`}>{product.badge}</span>
          )}
        </div>

        {/* Infos */}
        <div className="detail-info">
          <p className="detail-category">
            {product.category.replace('-', ' ')}
          </p>
          <h1 className="detail-name">{product.name}</h1>

          {/* Note */}
          <div className="detail-rating">
            <Stars rating={product.rating} />
            <span className="detail-rating-val">{product.rating}/5</span>
            <span className="detail-reviews">({product.reviews} avis)</span>
          </div>

          {/* Prix */}
          <div className="detail-price">
            {formatPrice(product.price)}
          </div>

          {/* Stock */}
          <div className={`detail-stock ${product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : 'ok'}`}>
            {product.stock === 0
              ? '❌ Rupture de stock'
              : product.stock <= 5
              ? `⚠️ Plus que ${product.stock} en stock`
              : `✅ En stock (${product.stock} disponibles)`}
          </div>

          {/* Quantité + panier */}
          {product.stock > 0 && (
            <div className="detail-actions">
              <div className="qty-selector">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>+</button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleAdd}>
                🛒 Ajouter au panier
              </button>
            </div>
          )}

          {inCart && (
            <p className="detail-incart">
              🛒 {cartQty} exemplaire{cartQty > 1 ? 's' : ''} déjà dans votre panier.{' '}
              <Link to="/panier">Voir le panier →</Link>
            </p>
          )}

          {/* Avantages */}
          <ul className="detail-perks">
            <li>🚚 Livraison gratuite dès {formatPrice(SEUIL_LIVRAISON_GRATUITE)}</li>
            <li>↩️ Retour gratuit sous 30 jours</li>
            <li>🔒 Paiement 100% sécurisé</li>
            <li>🛡️ Garantie fabricant 2 ans</li>
          </ul>
        </div>
      </div>

      {/* ---- Onglets ---------------------------------------- */}
      <div className="detail-tabs">
        <div className="tabs-nav">
          {['description', 'specifications', 'avis'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {{ description: '📋 Description', specifications: '⚙️ Caractéristiques', avis: '⭐ Avis' }[tab]}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <p className="tab-description">{product.description}</p>
          )}

          {activeTab === 'specifications' && product.specs && (
            <table className="specs-table">
              <tbody>
                {Object.entries(product.specs).map(([k, v]) => (
                  <tr key={k}>
                    <th>{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'avis' && (
            <div className="fake-reviews">
              {[
                { author: 'Moussa K.',    note: 5, text: 'Excellent produit, livraison rapide. Je recommande vivement !' },
                { author: 'Fatoumata D.', note: 4, text: 'Très bon rapport qualité/prix. Emballage soigné.' },
                { author: 'Alfousseynou D.', note: 5, text: 'Parfait, conforme à la description. Très satisfait.' },
              ].map((r, i) => (
                <div className="review-card" key={i}>
                  <div className="review-header">
                    <span className="review-author">{r.author}</span>
                    <span className="stars">{'★'.repeat(r.note)}{'☆'.repeat(5 - r.note)}</span>
                  </div>
                  <p>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- Produits similaires ---------------------------- */}
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-title">
            <h2>Produits Similaires</h2>
            <div className="title-underline" />
          </div>
          <div className="related-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Toast */}
      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
};

export default ProductDetail;
