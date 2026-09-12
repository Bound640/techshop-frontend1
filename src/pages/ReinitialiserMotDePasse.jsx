import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './Auth.css';
import { messageErreurApi } from '../utils/apiError';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const ReinitialiserMotDePasse = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ motDePasse: '', confirmation: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr]   = useState('');
  const [showMdp, setShowMdp] = useState(false);

  const champ = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiErr('');
  };

  const valider = () => {
    const e = {};
    if (!form.motDePasse || form.motDePasse.length < 8) {
      e.motDePasse = 'Le mot de passe doit faire au moins 8 caractères';
    }
    if (form.confirmation !== form.motDePasse) {
      e.confirmation = 'Les mots de passe ne correspondent pas';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valider()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/reinitialiser-mot-de-passe/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nouveauMotDePasse: form.motDePasse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lien invalide ou expiré.');

      // Le mot de passe est réinitialisé : on redirige vers la connexion
      navigate('/connexion', { state: { toast: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' } });
    } catch (err) {
      setApiErr(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <Link to="/" className="auth-logo">⚡ <strong>Tech</strong>Shop</Link>
          <h1>Nouveau mot de passe</h1>
          <p>Choisissez un nouveau mot de passe pour votre compte</p>
        </div>

        {apiErr && <div className="auth-alert auth-alert--error">⚠️ {apiErr}</div>}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-group">
            <label htmlFor="motDePasse">Nouveau mot de passe</label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="motDePasse" name="motDePasse"
                type={showMdp ? 'text' : 'password'}
                placeholder="8 caractères minimum"
                value={form.motDePasse}
                onChange={champ}
                className={errors.motDePasse ? 'error' : ''}
                autoComplete="new-password"
                autoFocus
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

          <div className="form-group">
            <label htmlFor="confirmation">Confirmer le mot de passe</label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="confirmation" name="confirmation"
                type={showMdp ? 'text' : 'password'}
                placeholder="Répétez le mot de passe"
                value={form.confirmation}
                onChange={champ}
                className={errors.confirmation ? 'error' : ''}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmation && <span className="form-error">⚠ {errors.confirmation}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg auth-submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading"><span className="spinner" /> Réinitialisation...</span>
            ) : (
              '🔑 Réinitialiser le mot de passe'
            )}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/connexion" className="auth-link">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
};

export default ReinitialiserMotDePasse;
