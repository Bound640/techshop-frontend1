// ============================================================
// TechShop - Gestion globale du panier
// Fichier : src/context/CartContext.js
// ============================================================

import { createContext, useContext, useReducer, useEffect } from 'react';
import { SEUIL_LIVRAISON_GRATUITE, FRAIS_LIVRAISON, TAUX_TVA } from '../utils/formatPrice';

// ---- Reducer -----------------------------------------------
const cartReducer = (state, action) => {
  switch (action.type) {

    case 'ADD_TO_CART': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: Math.min(i.quantity + 1, action.payload.stock) }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };

    case 'UPDATE_QTY':
      if (action.payload.qty <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.qty } : i
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

// ---- Initialisation depuis localStorage --------------------
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem('techshop_cart');
    return saved ? JSON.parse(saved) : { items: [] };
  } catch {
    return { items: [] };
  }
};

// ---- Context -----------------------------------------------
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadFromStorage);

  // Persister dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('techshop_cart', JSON.stringify(state));
  }, [state]);

  // Données calculées
  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal   = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping   = subtotal >= SEUIL_LIVRAISON_GRATUITE ? 0 : FRAIS_LIVRAISON;
  const tva        = subtotal * TAUX_TVA;
  const total      = subtotal + shipping + tva;
  const freeShippingLeft = Math.max(0, SEUIL_LIVRAISON_GRATUITE - subtotal);

  const addToCart    = (product) => dispatch({ type: 'ADD_TO_CART',    payload: product });
  const removeFromCart = (id)    => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  const updateQty    = (id, qty) => dispatch({ type: 'UPDATE_QTY',     payload: { id, qty } });
  const clearCart    = ()        => dispatch({ type: 'CLEAR_CART' });
  const isInCart     = (id)      => state.items.some(i => i.id === id);
  const getItemQty   = (id)      => state.items.find(i => i.id === id)?.quantity || 0;

  return (
    <CartContext.Provider value={{
      items: state.items,
      totalItems,
      subtotal,
      shipping,
      tva,
      total,
      freeShippingLeft,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      isInCart,
      getItemQty,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans CartProvider');
  return ctx;
};
