import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { API_URL } from '../utils/api';
import './ProductCard.css';

const Stars = ({ rating }) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="stars" aria-label={`Note : ${rating}/5`}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
    </span>
  );
};

const badgeColor = {
  'Nouveau':     'badge-blue',
  'Best-seller': 'badge-amber',
  'Top rated':   'badge-purple',
  'Pro':         'badge-green',
};

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { estConnecte, fetchAuth, user, majUtilisateur } = useAuth();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const estFavori = user?.favoris?.some((fid) => String(fid) === String(product.id)) || false;

  const handleAdd = (e) => {
    e.preventDefault(); // ne pas naviguer vers la fiche
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleFavori = async (e) => {
    e.preventDefault();
    if (!estConnecte) return;
    try {
      const res  = await fetchAuth(`${API_URL}/auth/favoris/${product.id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        const nouveaux = data.estFavori
          ? [...(user.favoris || []), product.id]
          : (user.favoris || []).filter((fid) => String(fid) !== String(product.id));
        majUtilisateur({ ...user, favoris: nouveaux });
      }
    } catch { /* silencieux */ }
  };

  const inCart = isInCart(product.id);

  return (
    <Link to={`/produits/${product.id}`} className="product-card">
      {/* Badge */}
      {product.badge && (
        <span className={`badge ${badgeColor[product.badge] || 'badge-blue'} product-card__badge`}>
          {product.badge}
        </span>
      )}

      {estConnecte && (
        <button
          className={`product-card__fav ${estFavori ? 'active' : ''}`}
          onClick={handleFavori}
          aria-label={estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {estFavori ? '❤️' : '🤍'}
        </button>
      )}

      {/* Image */}
      <div className="product-card__img-wrap">
        <img
          src={imgError ? 'https://via.placeholder.com/300x220?text=TechShop' : product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Infos */}
      <div className="product-card__body">
        <p className="product-card__category">{product.category.replace('-', ' ')}</p>
        <h3 className="product-card__name">{product.name}</h3>

        <div className="product-card__rating">
          <Stars rating={product.rating} />
          <span className="product-card__reviews">({product.reviews})</span>
        </div>

        <div className="product-card__footer">
          <p className="product-card__price">
            {product.enPromo && (
              <span className="product-card__price-old">{formatPrice(product.originalPrice)}</span>
            )}
            {formatPrice(product.price)}
          </p>

          <button
            className={`btn btn-sm${inCart ? ' btn-secondary' : ' btn-primary'}${added ? ' btn-added' : ''}`}
            onClick={handleAdd}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            {added ? '✓ Ajouté !' : inCart ? '✓ Dans le panier' : '+ Panier'}
          </button>
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p className="product-card__stock-warn">⚠️ Plus que {product.stock} en stock !</p>
        )}
        {product.stock === 0 && (
          <p className="product-card__stock-out">Rupture de stock</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
