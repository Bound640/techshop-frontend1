// ============================================================
// TechShop — Page d'inscription
// Fichier : src/pages/Inscription.js
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Inscription = () => {
  const { inscrire } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', confirmer: '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState('');
  const [showMdp, setShowMdp] = useState(false);

  const champ = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiErr('');
  };

  const valider = () => {
    const e = {};
    if (!form.nom.trim()    || form.nom.trim().length < 2)    e.nom     = 'Nom requis (min. 2 caractères)';
    if (!form.prenom.trim() || form.prenom.trim().length < 2) e.prenom  = 'Prénom requis (min. 2 caractères)';
    if (!form.email.match(/^\S+@\S+\.\S+$/))                  e.email   = 'Email invalide';
    if (form.motDePasse.length < 8)                           e.motDePasse = 'Mot de passe : 8 caractères minimum';
    if (form.motDePasse !== form.confirmer)                   e.confirmer  = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valider()) return;
    setLoading(true);
    try {
      await inscrire({
        nom:        form.nom.trim(),
        prenom:     form.prenom.trim(),
        email:      form.email.trim(),
        motDePasse: form.motDePasse,
      });
      navigate('/', { state: { toast: `Bienvenue ${form.prenom} ! Compte créé avec succès.` } });
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  const force = () => {
    const p = form.motDePasse;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8)       score++;
    if (/[A-Z]/.test(p))     score++;
    if (/[0-9]/.test(p))     score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const f = force();
  const forceLabel = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'][f] || '';
  const forceCls   = ['', 'weak',   'fair',  'good', 'strong'][f]    || '';

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">

        {/* En-tête */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">⚡ <strong>Tech</strong>Shop</Link>
          <h1>Créer un compte</h1>
          <p>Rejoignez TechShop et accédez à nos offres exclusives</p>
        </div>

        {/* Erreur API */}
        {apiErr && (
          <div className="auth-alert auth-alert--error">
            ⚠️ {apiErr}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">

          {/* Nom / Prénom */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom *</label>
              <input
                id="nom" name="nom" type="text"
                placeholder="ex : NDAO"
                value={form.nom}
                onChange={champ}
                className={errors.nom ? 'error' : ''}
                autoComplete="family-name"
              />
              {errors.nom && <span className="form-error">⚠ {errors.nom}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="prenom">Prénom *</label>
              <input
                id="prenom" name="prenom" type="text"
                placeholder="ex : Boundia"
                value={form.prenom}
                onChange={champ}
                className={errors.prenom ? 'error' : ''}
                autoComplete="given-name"
              />
              {errors.prenom && <span className="form-error">⚠ {errors.prenom}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Adresse email *</label>
            <div className="input-icon-wrap">
              <span className="input-icon">✉️</span>
              <input
                id="email" name="email" type="email"
                placeholder="exemple@email.com"
                value={form.email}
                onChange={champ}
                className={errors.email ? 'error' : ''}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error">⚠ {errors.email}</span>}
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label htmlFor="motDePasse">Mot de passe *</label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="motDePasse" name="motDePasse"
                type={showMdp ? 'text' : 'password'}
                placeholder="Min. 8 caractères"
                value={form.motDePasse}
                onChange={champ}
                className={errors.motDePasse ? 'error' : ''}
                autoComplete="new-password"
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
            {/* Indicateur de force */}
            {form.motDePasse && (
              <div className="pwd-strength">
                <div className={`pwd-bar ${forceCls}`}>
                  <div className="pwd-fill" style={{ width: `${(f / 4) * 100}%` }} />
                </div>
                <span className={`pwd-label ${forceCls}`}>{forceLabel}</span>
              </div>
            )}
            {errors.motDePasse && <span className="form-error">⚠ {errors.motDePasse}</span>}
          </div>

          {/* Confirmer mot de passe */}
          <div className="form-group">
            <label htmlFor="confirmer">Confirmer le mot de passe *</label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="confirmer" name="confirmer"
                type={showMdp ? 'text' : 'password'}
                placeholder="Répéter le mot de passe"
                value={form.confirmer}
                onChange={champ}
                className={errors.confirmer ? 'error' : (form.confirmer && form.confirmer === form.motDePasse ? 'success' : '')}
                autoComplete="new-password"
              />
              {form.confirmer && form.confirmer === form.motDePasse && (
                <span className="input-check">✅</span>
              )}
            </div>
            {errors.confirmer && <span className="form-error">⚠ {errors.confirmer}</span>}
          </div>

          {/* Soumettre */}
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Création du compte...
              </span>
            ) : (
              '🚀 Créer mon compte'
            )}
          </button>
        </form>

        {/* Lien connexion */}
        <p className="auth-footer">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="auth-link">Se connecter →</Link>
        </p>
      </div>
    </div>
  );
};

export default Inscription;
