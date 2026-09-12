import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL, adapterProduit } from '../utils/api';
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
  const { addToCart, isInCart, getItemQty } = useCart();
  const { estConnecte, fetchAuth, user, majUtilisateur } = useAuth();

  const [product, setProduct]     = useState(null);
  const [related, setRelated]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erreur404, setErreur404] = useState(false);
  const [imgActive, setImgActive] = useState(0);
  const [qty, setQty]             = useState(1);
  const [toast, setToast]         = useState('');
  const [activeTab, setActiveTab] = useState('description');

  const [avis, setAvis]           = useState([]);
  const [avisForm, setAvisForm]   = useState({ note: 5, commentaire: '' });
  const [avisLoading, setAvisLoading] = useState(false);
  const [avisErr, setAvisErr]     = useState('');

  const estFavori = user?.favoris?.some((fid) => String(fid) === id) || false;

  const charger = useCallback(async () => {
    setLoading(true);
    setErreur404(false);
    setImgActive(0);
    setQty(1);
    try {
      const res  = await fetch(`${API_URL}/produits/${id}`);
      if (!res.ok) { setErreur404(true); return; }
      const data = await res.json();
      const p = adapterProduit(data.produit);
      setProduct(p);

      // Produits similaires (même catégorie)
      if (data.produit.categorie?._id || data.produit.categorie) {
        const catId = data.produit.categorie._id || data.produit.categorie;
        const resRel = await fetch(`${API_URL}/produits?categorie=${catId}&limit=4`);
        const dataRel = await resRel.json();
        setRelated((dataRel.produits || []).filter(rp => rp._id !== id).slice(0, 4).map(adapterProduit));
      }

      // Avis
      const resAvis = await fetch(`${API_URL}/avis/produit/${id}`);
      const dataAvis = await resAvis.json();
      setAvis(dataAvis.avis || []);
    } catch {
      setErreur404(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { window.scrollTo(0, 0); charger(); }, [charger]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem 1rem' }}><span className="spinner" /></div>;
  }

  if (erreur404 || !product) {
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

  const inCart  = isInCart(product.id);
  const cartQty = getItemQty(product.id);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setToast(`✅ ${qty} × ${product.name} ajouté${qty > 1 ? 's' : ''} au panier !`);
    setTimeout(() => setToast(''), 2500);
  };

  const toggleFavori = async () => {
    if (!estConnecte) {
      navigate('/connexion', { state: { from: `/produits/${id}` } });
      return;
    }
    try {
      const res  = await fetchAuth(`${API_URL}/auth/favoris/${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        const nouveauxFavoris = data.estFavori
          ? [...(user.favoris || []), id]
          : (user.favoris || []).filter((fid) => String(fid) !== id);
        majUtilisateur({ ...user, favoris: nouveauxFavoris });
      }
    } catch { /* silencieux */ }
  };

  const soumettreAvis = async (e) => {
    e.preventDefault();
    setAvisErr('');
    setAvisLoading(true);
    try {
      const res  = await fetchAuth(`${API_URL}/avis/produit/${id}`, {
        method: 'POST',
        body: JSON.stringify(avisForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'envoi de l'avis.");
      setAvis([data.avis, ...avis]);
      setAvisForm({ note: 5, commentaire: '' });
    } catch (err) {
      setAvisErr(err.message);
    } finally {
      setAvisLoading(false);
    }
  };

  const dejaNote = avis.some((a) => a.utilisateur?._id === user?.id || String(a.utilisateur) === user?.id);

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

        {/* Galerie d'images */}
        <div className="detail-gallery">
          <div className="detail-img">
            <img src={product.images[imgActive]?.url || product.image} alt={product.name} />
            {product.badge && (
              <span className="badge badge-blue detail-badge">{product.badge}</span>
            )}
            <button
              className={`detail-fav-btn ${estFavori ? 'active' : ''}`}
              onClick={toggleFavori}
              aria-label={estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              title={estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              {estFavori ? '❤️' : '🤍'}
            </button>
          </div>
          {product.images.length > 1 && (
            <div className="detail-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`detail-thumb ${i === imgActive ? 'active' : ''}`}
                  onClick={() => setImgActive(i)}
                >
                  <img src={img.url} alt={`${product.name} vue ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="detail-info">
          <p className="detail-category">
            {product.marque && <strong>{product.marque}</strong>}{product.marque && ' · '}
            {product.categoryLabel || product.category.replace('-', ' ')}
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
            {product.enPromo && (
              <span className="detail-price-old">{formatPrice(product.originalPrice)}</span>
            )}
            {formatPrice(product.price)}
            {product.enPromo && (
              <span className="badge badge-amber detail-promo-badge">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            )}
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
              {{ description: '📋 Description', specifications: '⚙️ Caractéristiques', avis: `⭐ Avis (${avis.length})` }[tab]}
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
            <div className="reviews-section">
              {estConnecte && !dejaNote && (
                <form className="review-form" onSubmit={soumettreAvis}>
                  <h4>Laisser un avis</h4>
                  {avisErr && <div className="auth-alert auth-alert--error">⚠️ {avisErr}</div>}
                  <div className="review-form-note">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        className={`review-star-btn ${avisForm.note >= n ? 'active' : ''}`}
                        onClick={() => setAvisForm({ ...avisForm, note: n })}
                      >★</button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Votre avis sur ce produit..."
                    rows={3}
                    value={avisForm.commentaire}
                    onChange={(e) => setAvisForm({ ...avisForm, commentaire: e.target.value })}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={avisLoading}>
                    {avisLoading ? 'Envoi...' : 'Publier mon avis'}
                  </button>
                </form>
              )}
              {!estConnecte && (
                <p className="review-login-hint">
                  <Link to="/connexion">Connectez-vous</Link> pour laisser un avis sur ce produit.
                </p>
              )}

              {avis.length === 0 ? (
                <p style={{ color: 'var(--gray-500)' }}>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
              ) : (
                avis.map((a) => (
                  <div className="review-card" key={a._id}>
                    <div className="review-header">
                      <span className="review-author">{a.utilisateur?.prenom} {a.utilisateur?.nom?.[0]}.</span>
                      <span className="stars">{'★'.repeat(a.note)}{'☆'.repeat(5 - a.note)}</span>
                    </div>
                    <p>{a.commentaire}</p>
                  </div>
                ))
              )}
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
