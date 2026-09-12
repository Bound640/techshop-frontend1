import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listePays } from '../data/pays';
import { messageErreurApi } from '../utils/apiError';
import './Support.css';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const CATEGORIES = [
  'Promotion : Pack de jeux et pack matériel',
  'Enregistrement des produits',
  "Problème d'achat",
  'Garantie et service de réparation',
  'Support technique',
  'Programme de récompenses',
  'Application mobile',
];

const EXTENSIONS_ACCEPTEES = '.gif,.jpg,.jpeg,.png,.zip,.txt';
const TAILLE_MAX_MO = 3;

const valeursInitiales = {
  email: '', prenom: '', nom: '', titre: '',
  pays: '', ville: '', telephone: '', adresse: '',
  categorie: '', nomProduit: '', nomModele: '', numeroSerie: '',
  sujet: '', questions: '',
};

const Support = () => {
  const { token, estConnecte } = useAuth();
  const [form, setForm]       = useState(valeursInitiales);
  const [fichier, setFichier] = useState(null);
  const [erreurs, setErreurs] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr]   = useState('');
  const [envoye, setEnvoye]   = useState(false);

  const champ = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreurs({ ...erreurs, [e.target.name]: '' });
    setApiErr('');
  };

  const champFichier = (e) => {
    const f = e.target.files?.[0];
    if (!f) { setFichier(null); return; }

    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!EXTENSIONS_ACCEPTEES.includes(ext)) {
      setErreurs({ ...erreurs, fichier: 'Format non supporté. Utilisez : gif, jpg, png, zip, txt.' });
      e.target.value = '';
      setFichier(null);
      return;
    }
    if (f.size > TAILLE_MAX_MO * 1024 * 1024) {
      setErreurs({ ...erreurs, fichier: `Le fichier dépasse la taille maximale de ${TAILLE_MAX_MO} Mo.` });
      e.target.value = '';
      setFichier(null);
      return;
    }
    setErreurs({ ...erreurs, fichier: '' });
    setFichier(f);
  };

  const valider = () => {
    const e = {};
    const requis = [
      'email', 'prenom', 'nom', 'titre', 'pays', 'ville', 'telephone', 'adresse',
      'categorie', 'nomProduit', 'nomModele', 'numeroSerie', 'sujet', 'questions',
    ];
    requis.forEach((champName) => {
      if (!form[champName]?.trim()) e[champName] = 'Ce champ est requis';
    });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = 'Adresse email invalide';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valider()) return;

    setLoading(true);
    setApiErr('');
    try {
      const donnees = new FormData();
      Object.entries(form).forEach(([cle, valeur]) => donnees.append(cle, valeur));
      if (fichier) donnees.append('fichier', fichier);

      // On n'utilise pas fetchAuth ici : il force le Content-Type JSON,
      // ce qui casserait le boundary multipart nécessaire pour l'upload
      // de fichier. Le navigateur doit définir ce header lui-même.
      const options = {
        method: 'POST',
        body: donnees,
        headers: estConnecte ? { Authorization: `Bearer ${token}` } : {},
      };
      const res  = await fetch(`${API_URL}/support`, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'envoi de votre demande.");

      setEnvoye(true);
      setForm(valeursInitiales);
      setFichier(null);
    } catch (err) {
      setApiErr(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  };

  if (envoye) {
    return (
      <div className="support-page">
        <div className="support-success">
          <div className="support-success-icon">✅</div>
          <h2>Demande envoyée avec succès</h2>
          <p>Merci de nous avoir contactés. Notre équipe reviendra vers vous dans les plus brefs délais à l'adresse indiquée.</p>
          <div className="support-success-actions">
            <button className="btn btn-secondary" onClick={() => setEnvoye(false)}>Envoyer une autre demande</button>
            <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="support-page">
      <div className="support-header">
        <h1>📩 Contact & Support</h1>
        <p>Une question, un problème d'achat, une demande de garantie ? Remplissez le formulaire ci-dessous.</p>
      </div>

      {apiErr && <div className="auth-alert auth-alert--error">⚠️ {apiErr}</div>}

      <form onSubmit={handleSubmit} className="support-form" noValidate encType="multipart/form-data">
        <h3 className="support-section-title">👤 Vos coordonnées</h3>

        <div className="form-group">
          <label htmlFor="email">Email <span className="req">*</span></label>
          <input id="email" name="email" type="email" value={form.email} onChange={champ}
                 className={erreurs.email ? 'error' : ''} />
          {erreurs.email && <span className="form-error">⚠ {erreurs.email}</span>}
        </div>

        <div className="admin-form-row">
          <div className="form-group">
            <label htmlFor="prenom">Prénom <span className="req">*</span></label>
            <input id="prenom" name="prenom" value={form.prenom} onChange={champ}
                   className={erreurs.prenom ? 'error' : ''} />
            {erreurs.prenom && <span className="form-error">⚠ {erreurs.prenom}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="nom">Nom de famille <span className="req">*</span></label>
            <input id="nom" name="nom" value={form.nom} onChange={champ}
                   className={erreurs.nom ? 'error' : ''} />
            {erreurs.nom && <span className="form-error">⚠ {erreurs.nom}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Titre <span className="req">*</span></label>
          <div className="support-radio-group">
            <label className="support-radio">
              <input type="radio" name="titre" value="Monsieur" checked={form.titre === 'Monsieur'} onChange={champ} />
              Monsieur
            </label>
            <label className="support-radio">
              <input type="radio" name="titre" value="Mlle" checked={form.titre === 'Mlle'} onChange={champ} />
              Mlle
            </label>
          </div>
          {erreurs.titre && <span className="form-error">⚠ {erreurs.titre}</span>}
        </div>

        <div className="admin-form-row">
          <div className="form-group">
            <label htmlFor="pays">Région / Localisation <span className="req">*</span></label>
            <select id="pays" name="pays" value={form.pays} onChange={champ} className={erreurs.pays ? 'error' : ''}>
              <option value="">Sélectionner</option>
              {listePays.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {erreurs.pays && <span className="form-error">⚠ {erreurs.pays}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="ville">Ville / Banlieue <span className="req">*</span></label>
            <input id="ville" name="ville" value={form.ville} onChange={champ}
                   className={erreurs.ville ? 'error' : ''} />
            {erreurs.ville && <span className="form-error">⚠ {erreurs.ville}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Numéro de contact <span className="req">*</span></label>
          <input id="telephone" name="telephone" value={form.telephone} onChange={champ}
                 placeholder="+221 77 000 00 00" className={erreurs.telephone ? 'error' : ''} />
          {erreurs.telephone && <span className="form-error">⚠ {erreurs.telephone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="adresse">Adresse (nom et numéro de rue) <span className="req">*</span></label>
          <input id="adresse" name="adresse" value={form.adresse} onChange={champ}
                 className={erreurs.adresse ? 'error' : ''} />
          {erreurs.adresse && <span className="form-error">⚠ {erreurs.adresse}</span>}
        </div>

        <h3 className="support-section-title">🛠️ Votre demande</h3>

        <div className="form-group">
          <label htmlFor="categorie">Catégorie <span className="req">*</span></label>
          <select id="categorie" name="categorie" value={form.categorie} onChange={champ} className={erreurs.categorie ? 'error' : ''}>
            <option value="">Sélectionner</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {erreurs.categorie && <span className="form-error">⚠ {erreurs.categorie}</span>}
        </div>

        <div className="admin-form-row">
          <div className="form-group">
            <label htmlFor="nomProduit">Nom du produit <span className="req">*</span></label>
            <input id="nomProduit" name="nomProduit" value={form.nomProduit} onChange={champ}
                   className={erreurs.nomProduit ? 'error' : ''} />
            {erreurs.nomProduit && <span className="form-error">⚠ {erreurs.nomProduit}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="nomModele">Nom du modèle <span className="req">*</span></label>
            <input id="nomModele" name="nomModele" value={form.nomModele} onChange={champ}
                   className={erreurs.nomModele ? 'error' : ''} />
            {erreurs.nomModele && <span className="form-error">⚠ {erreurs.nomModele}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="numeroSerie">Numéro de série <span className="req">*</span></label>
          <input id="numeroSerie" name="numeroSerie" value={form.numeroSerie} onChange={champ}
                 className={erreurs.numeroSerie ? 'error' : ''} />
          {erreurs.numeroSerie && <span className="form-error">⚠ {erreurs.numeroSerie}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="sujet">Sujet <span className="req">*</span></label>
          <input id="sujet" name="sujet" value={form.sujet} onChange={champ}
                 className={erreurs.sujet ? 'error' : ''} />
          {erreurs.sujet && <span className="form-error">⚠ {erreurs.sujet}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="questions">Questions <span className="req">*</span></label>
          <textarea id="questions" name="questions" rows={5} value={form.questions} onChange={champ}
                    className={erreurs.questions ? 'error' : ''} />
          {erreurs.questions && <span className="form-error">⚠ {erreurs.questions}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="fichier">Fichier d'envoi</label>
          <input id="fichier" name="fichier" type="file" accept={EXTENSIONS_ACCEPTEES} onChange={champFichier} />
          <span className="profil-hint">
            Formats acceptés : gif, jpg, png, zip, txt. Taille maximale : {TAILLE_MAX_MO} Mo.
            Astuce : tu peux vérifier la configuration de ton système avec Windows msinfo32.exe ou CPU-Z.
          </span>
          {fichier && <span className="support-file-name">📎 {fichier.name}</span>}
          {erreurs.fichier && <span className="form-error">⚠ {erreurs.fichier}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? (
            <span className="btn-loading"><span className="spinner" /> Envoi en cours...</span>
          ) : (
            '📨 Envoyer ma demande'
          )}
        </button>
      </form>
    </div>
  );
};

export default Support;
