// ============================================================
// TechShop - Panier d'achat
// Fichier : src/pages/Cart.js
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, SEUIL_LIVRAISON_GRATUITE } from '../utils/formatPrice';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const {
    items, totalItems, subtotal, shipping, tva, total,
    freeShippingLeft, removeFromCart, updateQty, clearCart
  } = useCart();

  const [orderDone, setOrderDone] = useState(false);
  const [form, setForm]           = useState({ nom: '', email: '', adresse: '', ville: '' });
  const [errors, setErrors]       = useState({});
  const [step, setStep]           = useState(1); // 1=panier, 2=livraison, 3=confirmation

  // ---- Validation formulaire ----
  const validate = () => {
    const e = {};
    if (!form.nom.trim())     e.nom     = 'Nom requis';
    if (!form.email.includes('@')) e.email = 'Email invalide';
    if (!form.adresse.trim()) e.adresse  = 'Adresse requise';
    if (!form.ville.trim())   e.ville    = 'Ville requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOrder = () => {
    if (!validate()) return;
    clearCart();
    setOrderDone(true);
    setStep(3);
  };

  // ---- Confirmation ----
  if (orderDone) {
    return (
      <div className="container order-confirm fade-in">
        <div className="confirm-card">
          <div className="confirm-icon">🎉</div>
          <h1>Commande confirmée !</h1>
          <p>Merci pour votre achat, <strong>{form.nom}</strong>.</p>
          <p>Un email de confirmation a été envoyé à <strong>{form.email}</strong>.</p>
          <p className="confirm-delivery">📦 Livraison prévue à <strong>{form.ville}</strong> sous 3-5 jours ouvrés.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // ---- Panier vide ----
  if (items.length === 0) {
    return (
      <div className="container empty-state" style={{ minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="icon">🛒</div>
        <h3>Votre panier est vide</h3>
        <p>Découvrez nos produits et ajoutez-les à votre panier.</p>
        <Link to="/produits" className="btn btn-primary" style={{ marginTop: '1.2rem' }}>
          Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1 className="cart-title">🛒 Mon Panier <span>({totalItems} article{totalItems > 1 ? 's' : ''})</span></h1>

      {/* Steps */}
      <div className="cart-steps">
        {['Panier', 'Livraison', 'Confirmation'].map((s, i) => (
          <div key={s} className={`step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
            <span className="step-num">{step > i + 1 ? '✓' : i + 1}</span>
            <span className="step-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="cart-layout">

        {/* ---- Étape 1 : Articles ---- */}
        {step === 1 && (
          <div className="cart-items">
            {freeShippingLeft > 0 && (
              <div className="free-shipping-bar">
                🚚 Plus que <strong>{formatPrice(freeShippingLeft)}</strong> pour la livraison gratuite !
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.min(100, (subtotal / SEUIL_LIVRAISON_GRATUITE) * 100)}%` }} />
                </div>
              </div>
            )}
            {freeShippingLeft === 0 && (
              <div className="free-shipping-bar success">✅ Livraison gratuite débloquée !</div>
            )}

            {items.map(item => (
              <div className="cart-item" key={item.id}>
                <Link to={`/produits/${item.id}`} className="cart-item__img">
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="cart-item__info">
                  <Link to={`/produits/${item.id}`} className="cart-item__name">{item.name}</Link>
                  <p className="cart-item__unit">{formatPrice(item.price)} / unité</p>
                </div>
                <div className="cart-item__qty">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} aria-label="Diminuer">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label="Augmenter">+</button>
                </div>
                <div className="cart-item__subtotal">
                  {formatPrice((item.price * item.quantity))}
                </div>
                <button className="cart-item__remove" onClick={() => removeFromCart(item.id)} aria-label="Supprimer">✕</button>
              </div>
            ))}

            <div className="cart-toolbar">
              <button className="btn btn-secondary btn-sm" onClick={clearCart}>🗑 Vider le panier</button>
              <Link to="/produits" className="btn btn-outline btn-sm">← Continuer mes achats</Link>
            </div>
          </div>
        )}

        {/* ---- Étape 2 : Livraison ---- */}
        {step === 2 && (
          <div className="checkout-form">
            <h2>📦 Informations de livraison</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nom complet *</label>
                <input
                  type="text"
                  placeholder="ex : Boundia Ndao"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  className={errors.nom ? 'error' : ''}
                />
                {errors.nom && <span className="form-error">{errors.nom}</span>}
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="ex : boundia@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className="form-group form-group--full">
                <label>Adresse de livraison *</label>
                <input
                  type="text"
                  placeholder="ex : 12 Rue des Développeurs"
                  value={form.adresse}
                  onChange={e => setForm({ ...form, adresse: e.target.value })}
                  className={errors.adresse ? 'error' : ''}
                />
                {errors.adresse && <span className="form-error">{errors.adresse}</span>}
              </div>
              <div className="form-group">
                <label>Ville *</label>
                <input
                  type="text"
                  placeholder="ex : Thiès"
                  value={form.ville}
                  onChange={e => setForm({ ...form, ville: e.target.value })}
                  className={errors.ville ? 'error' : ''}
                />
                {errors.ville && <span className="form-error">{errors.ville}</span>}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)} style={{ marginTop: '1rem' }}>
              ← Retour au panier
            </button>
          </div>
        )}

        {/* ---- Récapitulatif (toujours visible) ---- */}
        <div className="cart-summary">
          <h3>Récapitulatif</h3>

          <div className="summary-lines">
            <div className="summary-line">
              <span>Sous-total ({totalItems} art.)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-line">
              <span>TVA (20%)</span>
              <span>{formatPrice(tva)}</span>
            </div>
            <div className="summary-line">
              <span>Livraison</span>
              <span className={shipping === 0 ? 'free' : ''}>
                {shipping === 0 ? '🎉 Gratuite' : formatPrice(shipping)}
              </span>
            </div>
          </div>

          <div className="summary-total">
            <span>Total TTC</span>
            <span>{formatPrice(total)}</span>
          </div>

          {step === 1 && (
            <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(2)}>
              Passer la commande →
            </button>
          )}
          {step === 2 && (
            <button className="btn btn-primary btn-full btn-lg" onClick={handleOrder}>
              ✅ Confirmer la commande
            </button>
          )}

          <div className="summary-secure">🔒 Paiement 100% sécurisé</div>

          {/* Récap articles */}
          <div className="summary-items">
            {items.map(item => (
              <div className="summary-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <span className="summary-item-name">{item.name}</span>
                <span>×{item.quantity}</span>
                <span>{formatPrice((item.price * item.quantity))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
