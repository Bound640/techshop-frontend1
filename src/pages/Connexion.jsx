// ============================================================
// TechShop — Page de connexion
// Fichier : src/pages/Connexion.js
// ============================================================

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Connexion = () => {
  const { connecter } = useAuth();
  const navigate       = useNavigate();
  const location        = useLocation();

  const [form, setForm]       = useState({ email: '', motDePasse: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr]   = useState('');
  const [showMdp, setShowMdp] = useState(false);

  const toastMessage = location.state?.toast || '';

  const champ = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiErr('');
  };

  const valider = () => {
    const e = {};
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Email invalide';
    if (!form.motDePasse) e.motDePasse = 'Mot de passe requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valider()) return;
    setLoading(true);
    try {
      const data = await connecter(form);
      // Redirection : admin -> dashboard, client -> accueil (ou page d'origine)
      const destination = data.user.role === 'admin'
        ? '/admin'
        : (location.state?.from || '/');
      navigate(destination);
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">

        <div className="auth-header">
          <Link to="/" className="auth-logo">⚡ <strong>Tech</strong>Shop</Link>
          <h1>Connexion</h1>
          <p>Accédez à votre compte TechShop</p>
        </div>

        {toastMessage && (
          <div className="auth-alert auth-alert--success">✅ {toastMessage}</div>
        )}
        {apiErr && (
          <div className="auth-alert auth-alert--error">⚠️ {apiErr}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">

          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <div className="input-icon-wrap">
              <span className="input-icon">✉️</span>
              <input
                id="email" name="email" type="email"
                placeholder="exemple@email.com"
                value={form.email}
                onChange={champ}
                className={errors.email ? 'error' : ''}
                autoComplete="email"
                autoFocus
              />
            </div>
            {errors.email && <span className="form-error">⚠ {errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="motDePasse">Mot de passe</label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="motDePasse" name="motDePasse"
                type={showMdp ? 'text' : 'password'}
                placeholder="Votre mot de passe"
                value={form.motDePasse}
                onChange={champ}
                className={errors.motDePasse ? 'error' : ''}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-toggle-pwd"
                onClick={() => setShowMdp(s => !s)}
                aria-label={showMdp ? 'Masquer' : 'Afficher'}
              >
                {showMdp ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.motDePasse && <span className="form-error">⚠ {errors.motDePasse}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading"><span className="spinner" /> Connexion...</span>
            ) : (
              '🔑 Se connecter'
            )}
          </button>
        </form>

        {/* Comptes de test */}
        <div className="auth-demo">
          <p>🧪 Comptes de démonstration :</p>
          <button
            type="button"
            className="demo-btn"
            onClick={() => setForm({ email: 'admin@techshop.sn', motDePasse: 'Admin@2025' })}
          >
            👑 Admin : admin@techshop.sn
          </button>
          <button
            type="button"
            className="demo-btn"
            onClick={() => setForm({ email: 'client@techshop.sn', motDePasse: 'Client@2025' })}
          >
            🙂 Client : client@techshop.sn
          </button>
        </div>

        <p className="auth-footer">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="auth-link">Créer un compte →</Link>
        </p>
      </div>
    </div>
  );
};

export default Connexion;
