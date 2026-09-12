import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profil.css';
import { messageErreurApi } from '../utils/apiError';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Profil = () => {
  const { user, fetchAuth, majUtilisateur, deconnecter } = useAuth();
  const [onglet, setOnglet] = useState('infos');

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <span className="spinner" /> <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profil-page">
      <div className="profil-header">
        <div className="profil-avatar">
          {user.prenom?.[0]?.toUpperCase()}{user.nom?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2>{user.prenom} {user.nom}</h2>
          <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
            {user.role === 'admin' ? '👑 Administrateur' : '🙂 Client'}
          </span>
        </div>
      </div>

      <div className="profil-tabs">
        <button className={`profil-tab ${onglet === 'infos' ? 'active' : ''}`} onClick={() => setOnglet('infos')}>
          👤 Informations
        </button>
        <button className={`profil-tab ${onglet === 'mdp' ? 'active' : ''}`} onClick={() => setOnglet('mdp')}>
          🔒 Mot de passe
        </button>
      </div>

      <div className="profil-card">
        {onglet === 'infos' && (
          <InfosForm user={user} fetchAuth={fetchAuth} majUtilisateur={majUtilisateur} />
        )}
        {onglet === 'mdp' && (
          <MotDePasseForm fetchAuth={fetchAuth} deconnecter={deconnecter} />
        )}
      </div>
    </div>
  );
};

/* ================================================================
   Formulaire : informations personnelles + adresse
   ================================================================ */
const InfosForm = ({ user, fetchAuth, majUtilisateur }) => {
  const [form, setForm] = useState({
    nom: user.nom || '',
    prenom: user.prenom || '',
    telephone: user.telephone || '',
    rue: user.adresse?.rue || '',
    ville: user.adresse?.ville || '',
    codePostal: user.adresse?.codePostal || '',
    pays: user.adresse?.pays || 'Sénégal',
  });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur]   = useState('');
  const [succes, setSucces]   = useState('');

  const champ = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSucces('');
    setErreur('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');
    setSucces('');
    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
        adresse: {
          rue: form.rue,
          ville: form.ville,
          codePostal: form.codePostal,
          pays: form.pays,
        },
      };
      const res  = await fetchAuth(`${API_URL}/auth/profil`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Une erreur est survenue.');
      majUtilisateur(data.user);
      setSucces('Profil mis à jour avec succès.');
    } catch (err) {
      setErreur(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profil-form">
      {erreur && <div className="auth-alert auth-alert--error">⚠️ {erreur}</div>}
      {succes && <div className="auth-alert auth-alert--success">✅ {succes}</div>}

      <div className="form-group">
        <label>Adresse email</label>
        <input value={user.email} disabled />
        <span className="profil-hint">L'email ne peut pas être modifié.</span>
      </div>

      <div className="admin-form-row">
        <div className="form-group">
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" name="prenom" value={form.prenom} onChange={champ} required />
        </div>
        <div className="form-group">
          <label htmlFor="nom">Nom</label>
          <input id="nom" name="nom" value={form.nom} onChange={champ} required />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="telephone">Téléphone</label>
        <input id="telephone" name="telephone" value={form.telephone} onChange={champ} placeholder="+221 77 000 00 00" />
      </div>

      <h4 className="profil-section-title">📍 Adresse de livraison</h4>

      <div className="form-group">
        <label htmlFor="rue">Rue</label>
        <input id="rue" name="rue" value={form.rue} onChange={champ} />
      </div>

      <div className="admin-form-row">
        <div className="form-group">
          <label htmlFor="ville">Ville</label>
          <input id="ville" name="ville" value={form.ville} onChange={champ} />
        </div>
        <div className="form-group">
          <label htmlFor="codePostal">Code postal</label>
          <input id="codePostal" name="codePostal" value={form.codePostal} onChange={champ} />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="pays">Pays</label>
        <input id="pays" name="pays" value={form.pays} onChange={champ} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
      </button>
    </form>
  );
};

/* ================================================================
   Formulaire : changement de mot de passe
   ================================================================ */
const MotDePasseForm = ({ fetchAuth, deconnecter }) => {
  const [form, setForm] = useState({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur]   = useState('');
  const [succes, setSucces]   = useState('');

  const champ = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSucces('');
    setErreur('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.nouveauMotDePasse.length < 8) {
      setErreur('Le nouveau mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (form.nouveauMotDePasse !== form.confirmation) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setErreur('');
    try {
      const res  = await fetchAuth(`${API_URL}/auth/changer-mot-de-passe`, {
        method: 'PUT',
        body: JSON.stringify({
          ancienMotDePasse: form.ancienMotDePasse,
          nouveauMotDePasse: form.nouveauMotDePasse,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Une erreur est survenue.');
      setSucces('Mot de passe modifié. Reconnectez-vous avec votre nouveau mot de passe...');
      setTimeout(() => deconnecter(), 1800);
    } catch (err) {
      setErreur(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profil-form">
      {erreur && <div className="auth-alert auth-alert--error">⚠️ {erreur}</div>}
      {succes && <div className="auth-alert auth-alert--success">✅ {succes}</div>}

      <div className="form-group">
        <label htmlFor="ancienMotDePasse">Mot de passe actuel</label>
        <input id="ancienMotDePasse" name="ancienMotDePasse" type="password" value={form.ancienMotDePasse} onChange={champ} required autoComplete="current-password" />
      </div>
      <div className="form-group">
        <label htmlFor="nouveauMotDePasse">Nouveau mot de passe</label>
        <input id="nouveauMotDePasse" name="nouveauMotDePasse" type="password" value={form.nouveauMotDePasse} onChange={champ} required minLength={8} autoComplete="new-password" />
      </div>
      <div className="form-group">
        <label htmlFor="confirmation">Confirmer le nouveau mot de passe</label>
        <input id="confirmation" name="confirmation" type="password" value={form.confirmation} onChange={champ} required autoComplete="new-password" />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Modification...' : '🔑 Changer le mot de passe'}
      </button>
    </form>
  );
};

export default Profil;
