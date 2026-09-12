import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import { messageErreurApi } from '../utils/apiError';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const MotDePasseOublie = () => {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [envoye, setEnvoye]     = useState(false);
  const [apiErr, setApiErr]     = useState('');
  const [lienDev, setLienDev]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setApiErr('Veuillez saisir un email valide.');
      return;
    }
    setApiErr('');
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/mot-de-passe-oublie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Une erreur est survenue.');
      setEnvoye(true);
      if (data.lienDev) setLienDev(data.lienDev);
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
          <h1>Mot de passe oublié</h1>
          <p>Recevez un lien pour réinitialiser votre mot de passe</p>
        </div>

        {apiErr && <div className="auth-alert auth-alert--error">⚠️ {apiErr}</div>}

        {envoye ? (
          <div className="auth-alert auth-alert--success">
            ✅ Si un compte existe avec cet email, un lien de réinitialisation a été généré.
            {lienDev && (
              <>
                <p style={{ marginTop: '.75rem', fontSize: '.85rem' }}>
                  Mode démo — lien direct :
                </p>
                <Link to={lienDev.replace(/^.*\/reinitialiser-mot-de-passe/, '/reinitialiser-mot-de-passe')} className="auth-link">
                  {lienDev}
                </Link>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <div className="input-icon-wrap">
                <span className="input-icon">✉️</span>
                <input
                  id="email" name="email" type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg auth-submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading"><span className="spinner" /> Envoi...</span>
              ) : (
                '📧 Envoyer le lien'
              )}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/connexion" className="auth-link">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
};

export default MotDePasseOublie;
