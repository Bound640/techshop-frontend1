// ============================================================
// TechShop - Carte produit réutilisable
// Fichier : src/components/ProductCard.js
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
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
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault(); // ne pas naviguer vers la fiche
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
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
