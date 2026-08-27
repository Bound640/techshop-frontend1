// ============================================================
// TechShop — Contexte d'authentification global
// Fichier : src/context/AuthContext.js
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
// const API_URL = 'http://localhost:3001/api';
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('techshop_token') || null);
  const [loading, setLoading] = useState(true);  // vrai pendant la vérification initiale

  // ---- Au démarrage : vérifier si le token est encore valide ----
  useEffect(() => {
    const verifier = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res  = await fetch(`${API_URL}/auth/moi`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUser(data.user);
        } else {
          // Token expiré ou invalide → déconnecter
          deconnecter();
        }
      } catch {
        deconnecter();
      } finally {
        setLoading(false);
      }
    };
    verifier();
  }, []); // eslint-disable-line

  // ---- Inscription -------------------------------------------
  const inscrire = async ({ nom, prenom, email, motDePasse }) => {
    const res  = await fetch(`${API_URL}/auth/inscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, email, motDePasse }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'inscription');
    _sauvegarderSession(data.token, data.user);
    return data;
  };

  // ---- Connexion ---------------------------------------------
  const connecter = async ({ email, motDePasse }) => {
    const res  = await fetch(`${API_URL}/auth/connexion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, motDePasse }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Identifiants invalides');
    _sauvegarderSession(data.token, data.user);
    return data;
  };

  // ---- Déconnexion -------------------------------------------
  const deconnecter = () => {
    localStorage.removeItem('techshop_token');
    setToken(null);
    setUser(null);
  };

  // ---- Requête authentifiée (helper) -------------------------
  const fetchAuth = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // ---- Interne -----------------------------------------------
  const _sauvegarderSession = (tok, usr) => {
    localStorage.setItem('techshop_token', tok);
    setToken(tok);
    setUser(usr);
  };

  const estConnecte = !!user;
  const estAdmin    = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      estConnecte, estAdmin,
      inscrire, connecter, deconnecter, fetchAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};
