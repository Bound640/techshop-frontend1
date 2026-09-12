import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import './Admin.css';
import { messageErreurApi } from '../utils/apiError';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const STATUTS_COMMANDE = ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee'];
const LABEL_STATUT = {
  en_attente: 'En attente', confirmee: 'Confirmée', en_preparation: 'En préparation',
  expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée',
};

const Admin = () => {
  const { fetchAuth, user } = useAuth();
  const [onglet, setOnglet] = useState('apercu');

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>📊 Tableau de bord administrateur</h1>
          <p>Bienvenue {user?.prenom}, gérez votre boutique TechShop.</p>
        </div>

        <div className="admin-tabs">
          {[
            ['apercu', "📈 Vue d'ensemble"],
            ['produits', '📦 Produits'],
            ['categories', '🗂️ Catégories'],
            ['commandes', '🧾 Commandes'],
            ['utilisateurs', '👥 Utilisateurs'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`admin-tab ${onglet === key ? 'active' : ''}`}
              onClick={() => setOnglet(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {onglet === 'apercu'        && <Apercu fetchAuth={fetchAuth} />}
          {onglet === 'produits'      && <Produits fetchAuth={fetchAuth} />}
          {onglet === 'categories'    && <Categories fetchAuth={fetchAuth} />}
          {onglet === 'commandes'     && <Commandes fetchAuth={fetchAuth} />}
          {onglet === 'utilisateurs'  && <Utilisateurs fetchAuth={fetchAuth} user={user} />}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   Vue d'ensemble — statistiques
   ================================================================ */
const Apercu = ({ fetchAuth }) => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetchAuth(`${API_URL}/commandes/admin/statistiques`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
        setStats(data);
      } catch (err) {
        setErreur(messageErreurApi(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  if (loading) return <Chargement />;
  if (erreur)  return <Erreur message={erreur} />;

  const revenu = stats?.revenuTotal?.[0]?.total || 0;

  return (
    <div className="admin-stats-grid">
      <StatCard icone="🧾" label="Commandes" valeur={stats?.totalCommandes ?? 0} />
      <StatCard icone="📦" label="Produits actifs" valeur={stats?.totalProduits ?? 0} />
      <StatCard icone="👥" label="Clients" valeur={stats?.totalUtilisateurs ?? 0} />
      <StatCard icone="💰" label="Revenu total" valeur={formatPrice(revenu)} />

      {stats?.commandesParStatut?.length > 0 && (
        <div className="admin-card admin-card--wide">
          <h3>Commandes par statut</h3>
          <div className="admin-status-list">
            {stats.commandesParStatut.map(s => (
              <div key={s._id} className="admin-status-row">
                <span className={`badge badge-blue`}>{LABEL_STATUT[s._id] || s._id}</span>
                <strong>{s.count}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icone, label, valeur }) => (
  <div className="admin-card">
    <div className="admin-stat-icon">{icone}</div>
    <div className="admin-stat-value">{valeur}</div>
    <div className="admin-stat-label">{label}</div>
  </div>
);

const Chargement = () => <div className="admin-loading"><span className="spinner" /> Chargement...</div>;
const Erreur = ({ message }) => <div className="auth-alert auth-alert--error">⚠️ {message}</div>;

/* ================================================================
   Produits
   ================================================================ */
const Produits = ({ fetchAuth }) => {
  const [produits, setProduits]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erreur, setErreur]       = useState('');
  const [succes, setSucces]       = useState('');
  const [edition, setEdition]     = useState(null); // null = fermé, {} = nouveau, {...} = édition

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [resP, resC] = await Promise.all([
        fetchAuth(`${API_URL}/produits/admin/tous`),
        fetch(`${API_URL}/categories`),
      ]);
      const dataP = await resP.json();
      const dataC = await resC.json();
      if (!resP.ok) throw new Error(dataP.message || 'Erreur de chargement');
      setProduits(dataP.produits);
      setCategories(dataC.categories || []);
    } catch (err) {
      setErreur(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  }, [fetchAuth]);

  useEffect(() => { charger(); }, [charger]);

  const supprimer = async (produit) => {
    if (!confirm(`Supprimer "${produit.nom}" ?`)) return;
    try {
      const res  = await fetchAuth(`${API_URL}/produits/${produit._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSucces('Produit supprimé.');
      charger();
    } catch (err) {
      setErreur(messageErreurApi(err));
    }
  };

  const reactiver = async (produit) => {
    try {
      const res  = await fetchAuth(`${API_URL}/produits/admin/${produit._id}/reactiver`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSucces('Produit réactivé.');
      charger();
    } catch (err) {
      setErreur(messageErreurApi(err));
    }
  };

  if (loading) return <Chargement />;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Produits ({produits.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setEdition({})}>➕ Ajouter un produit</button>
      </div>

      {erreur && <Erreur message={erreur} />}
      {succes && <div className="auth-alert auth-alert--success">✅ {succes}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {produits.map(p => (
              <tr key={p._id}>
                <td>{p.nom}</td>
                <td>{p.categorie?.nom || '—'}</td>
                <td>{formatPrice(p.prix)}</td>
                <td>
                  {p.stock}
                  {p.stock === 0 && <span className="badge badge-amber" style={{ marginLeft: '.5rem' }}>Rupture</span>}
                  {p.stock > 0 && p.stock <= 5 && <span className="badge badge-amber" style={{ marginLeft: '.5rem' }}>Stock faible</span>}
                </td>
                <td>
                  <span className={`badge ${p.actif ? 'badge-green' : 'badge-amber'}`}>
                    {p.actif ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="admin-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setEdition(p)}>✏️</button>
                  {p.actif ? (
                    <button className="btn btn-danger btn-sm" onClick={() => supprimer(p)}>🗑️</button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => reactiver(p)}>♻️</button>
                  )}
                </td>
              </tr>
            ))}
            {produits.length === 0 && (
              <tr><td colSpan={6} className="admin-empty">Aucun produit pour le moment.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {edition !== null && (
        <ProduitModal
          produit={edition}
          categories={categories}
          fetchAuth={fetchAuth}
          onClose={() => setEdition(null)}
          onSaved={() => { setEdition(null); setSucces('Produit enregistré.'); charger(); }}
        />
      )}
    </div>
  );
};

const ProduitModal = ({ produit, categories, fetchAuth, onClose, onSaved }) => {
  const estNouveau = !produit._id;
  const [form, setForm] = useState({
    nom: produit.nom || '',
    description: produit.description || '',
    prix: produit.prix || '',
    prixPromo: produit.prixPromo || '',
    marque: produit.marque || '',
    stock: produit.stock ?? '',
    categorie: produit.categorie?._id || produit.categorie || '',
    imageUrl: produit.images?.[0]?.url || '',
    badge: produit.badge || '',
    vedette: produit.vedette || false,
  });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur]   = useState('');

  const champ = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');
    try {
      const payload = {
        nom: form.nom,
        description: form.description,
        prix: Number(form.prix),
        prixPromo: form.prixPromo ? Number(form.prixPromo) : null,
        marque: form.marque,
        stock: Number(form.stock),
        categorie: form.categorie,
        badge: form.badge || null,
        vedette: form.vedette,
        images: form.imageUrl ? [{ url: form.imageUrl, principale: true }] : [],
      };
      const url    = estNouveau ? `${API_URL}/produits` : `${API_URL}/produits/${produit._id}`;
      const method = estNouveau ? 'POST' : 'PUT';
      const res  = await fetchAuth(url, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'enregistrement');
      onSaved();
    } catch (err) {
      setErreur(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{estNouveau ? 'Ajouter un produit' : 'Modifier le produit'}</h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        {erreur && <Erreur message={erreur} />}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Nom du produit</label>
            <input name="nom" value={form.nom} onChange={champ} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={champ} rows={3} required />
          </div>
          <div className="admin-form-row">
            <div className="form-group">
              <label>Prix (FCFA)</label>
              <input name="prix" type="number" min="0" value={form.prix} onChange={champ} required />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={champ} required />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="form-group">
              <label>Prix promo (FCFA) — optionnel</label>
              <input name="prixPromo" type="number" min="0" value={form.prixPromo} onChange={champ} placeholder="Laisser vide si pas de promo" />
            </div>
            <div className="form-group">
              <label>Marque</label>
              <input name="marque" value={form.marque} onChange={champ} placeholder="ex : JBL, Apple..." />
            </div>
          </div>
          <div className="form-group">
            <label>Catégorie</label>
            <select name="categorie" value={form.categorie} onChange={champ} required>
              <option value="">— Choisir —</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.icone} {c.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>URL de l'image</label>
            <input name="imageUrl" value={form.imageUrl} onChange={champ} placeholder="https://..." />
          </div>
          <div className="admin-form-row">
            <div className="form-group">
              <label>Badge</label>
              <select name="badge" value={form.badge} onChange={champ}>
                <option value="">Aucun</option>
                <option value="Nouveau">Nouveau</option>
                <option value="Best-seller">Best-seller</option>
                <option value="Top rated">Top rated</option>
                <option value="Pro">Pro</option>
              </select>
            </div>
            <div className="form-group admin-checkbox-group">
              <label>
                <input name="vedette" type="checkbox" checked={form.vedette} onChange={champ} />
                {' '}Produit vedette
              </label>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================================================================
   Catégories
   ================================================================ */
const Categories = ({ fetchAuth }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur]   = useState('');
  const [succes, setSucces]   = useState('');
  const [edition, setEdition] = useState(null);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetchAuth(`${API_URL}/categories/admin/toutes`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCategories(data.categories);
    } catch (err) {
      setErreur(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  }, [fetchAuth]);

  useEffect(() => { charger(); }, [charger]);

  const supprimer = async (cat) => {
    if (!confirm(`Supprimer la catégorie "${cat.nom}" ?`)) return;
    try {
      const res  = await fetchAuth(`${API_URL}/categories/${cat._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSucces('Catégorie supprimée.');
      charger();
    } catch (err) {
      setErreur(messageErreurApi(err));
    }
  };

  const reactiver = async (cat) => {
    try {
      const res  = await fetchAuth(`${API_URL}/categories/admin/${cat._id}/reactiver`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSucces('Catégorie réactivée.');
      charger();
    } catch (err) {
      setErreur(messageErreurApi(err));
    }
  };

  if (loading) return <Chargement />;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Catégories ({categories.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setEdition({})}>➕ Ajouter une catégorie</button>
      </div>

      {erreur && <Erreur message={erreur} />}
      {succes && <div className="auth-alert auth-alert--success">✅ {succes}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Icône</th><th>Nom</th><th>Ordre</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c._id}>
                <td style={{ fontSize: '1.3rem' }}>{c.icone}</td>
                <td>{c.nom}</td>
                <td>{c.ordre}</td>
                <td>
                  <span className={`badge ${c.actif ? 'badge-green' : 'badge-amber'}`}>
                    {c.actif ? 'Active' : 'Désactivée'}
                  </span>
                </td>
                <td className="admin-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setEdition(c)}>✏️</button>
                  {c.actif ? (
                    <button className="btn btn-danger btn-sm" onClick={() => supprimer(c)}>🗑️</button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => reactiver(c)}>♻️</button>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">Aucune catégorie.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {edition !== null && (
        <CategorieModal
          categorie={edition}
          fetchAuth={fetchAuth}
          onClose={() => setEdition(null)}
          onSaved={() => { setEdition(null); setSucces('Catégorie enregistrée.'); charger(); }}
        />
      )}
    </div>
  );
};

const CategorieModal = ({ categorie, fetchAuth, onClose, onSaved }) => {
  const estNouveau = !categorie._id;
  const [form, setForm] = useState({
    nom: categorie.nom || '',
    description: categorie.description || '',
    icone: categorie.icone || '📦',
    ordre: categorie.ordre ?? 0,
  });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur]   = useState('');

  const champ = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');
    try {
      const payload = { ...form, ordre: Number(form.ordre) };
      const url    = estNouveau ? `${API_URL}/categories` : `${API_URL}/categories/${categorie._id}`;
      const method = estNouveau ? 'POST' : 'PUT';
      const res  = await fetchAuth(url, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'enregistrement');
      onSaved();
    } catch (err) {
      setErreur(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{estNouveau ? 'Ajouter une catégorie' : 'Modifier la catégorie'}</h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        {erreur && <Erreur message={erreur} />}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-row">
            <div className="form-group">
              <label>Icône (emoji)</label>
              <input name="icone" value={form.icone} onChange={champ} maxLength={4} />
            </div>
            <div className="form-group">
              <label>Ordre d'affichage</label>
              <input name="ordre" type="number" value={form.ordre} onChange={champ} />
            </div>
          </div>
          <div className="form-group">
            <label>Nom</label>
            <input name="nom" value={form.nom} onChange={champ} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={champ} rows={2} />
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================================================================
   Commandes
   ================================================================ */
const Commandes = ({ fetchAuth }) => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erreur, setErreur]       = useState('');
  const [succes, setSucces]       = useState('');

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetchAuth(`${API_URL}/commandes/admin/toutes`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCommandes(data.commandes);
    } catch (err) {
      setErreur(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  }, [fetchAuth]);

  useEffect(() => { charger(); }, [charger]);

  const changerStatut = async (commande, statut) => {
    try {
      const res  = await fetchAuth(`${API_URL}/commandes/admin/${commande._id}/statut`, {
        method: 'PUT',
        body: JSON.stringify({ statut }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSucces('Statut mis à jour.');
      charger();
    } catch (err) {
      setErreur(messageErreurApi(err));
    }
  };

  if (loading) return <Chargement />;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Commandes ({commandes.length})</h2>
      </div>

      {erreur && <Erreur message={erreur} />}
      {succes && <div className="auth-alert auth-alert--success">✅ {succes}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>N° Commande</th><th>Client</th><th>Total</th><th>Statut</th><th>Date</th></tr>
          </thead>
          <tbody>
            {commandes.map(c => (
              <tr key={c._id}>
                <td>{c.numero}</td>
                <td>{c.utilisateur ? `${c.utilisateur.prenom} ${c.utilisateur.nom}` : '—'}</td>
                <td>{formatPrice(c.total)}</td>
                <td>
                  <select
                    className="admin-status-select"
                    value={c.statut}
                    onChange={(e) => changerStatut(c, e.target.value)}
                  >
                    {STATUTS_COMMANDE.map(s => (
                      <option key={s} value={s}>{LABEL_STATUT[s]}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
            {commandes.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">Aucune commande.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================================================================
   Utilisateurs
   ================================================================ */
const Utilisateurs = ({ fetchAuth, user }) => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [erreur, setErreur]             = useState('');
  const [succes, setSucces]             = useState('');
  const [edition, setEdition]           = useState(null);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetchAuth(`${API_URL}/utilisateurs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUtilisateurs(data.utilisateurs);
    } catch (err) {
      setErreur(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  }, [fetchAuth]);

  useEffect(() => { charger(); }, [charger]);

  const supprimer = async (u) => {
    if (!confirm(`Désactiver le compte de ${u.prenom} ${u.nom} ?`)) return;
    try {
      const res  = await fetchAuth(`${API_URL}/utilisateurs/${u.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSucces('Utilisateur désactivé.');
      charger();
    } catch (err) {
      setErreur(messageErreurApi(err));
    }
  };

  const reactiver = async (u) => {
    try {
      const res  = await fetchAuth(`${API_URL}/utilisateurs/${u.id}/reactiver`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSucces('Utilisateur réactivé.');
      charger();
    } catch (err) {
      setErreur(messageErreurApi(err));
    }
  };

  if (loading) return <Chargement />;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Utilisateurs ({utilisateurs.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setEdition({})}>➕ Ajouter un utilisateur</button>
      </div>

      {erreur && <Erreur message={erreur} />}
      {succes && <div className="auth-alert auth-alert--success">✅ {succes}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {utilisateurs.map(u => (
              <tr key={u.id}>
                <td>{u.prenom} {u.nom}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                    {u.role === 'admin' ? '👑 Admin' : 'Client'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.actif ? 'badge-green' : 'badge-amber'}`}>
                    {u.actif ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="admin-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setEdition(u)}>✏️</button>
                  {u.id !== user?.id && (
                    u.actif ? (
                      <button className="btn btn-danger btn-sm" onClick={() => supprimer(u)}>🗑️</button>
                    ) : (
                      <button className="btn btn-secondary btn-sm" onClick={() => reactiver(u)}>♻️</button>
                    )
                  )}
                </td>
              </tr>
            ))}
            {utilisateurs.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">Aucun utilisateur.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {edition !== null && (
        <UtilisateurModal
          utilisateur={edition}
          fetchAuth={fetchAuth}
          onClose={() => setEdition(null)}
          onSaved={() => { setEdition(null); setSucces('Utilisateur enregistré.'); charger(); }}
        />
      )}
    </div>
  );
};

const UtilisateurModal = ({ utilisateur, fetchAuth, onClose, onSaved }) => {
  const estNouveau = !utilisateur.id;
  const [form, setForm] = useState({
    nom: utilisateur.nom || '',
    prenom: utilisateur.prenom || '',
    email: utilisateur.email || '',
    motDePasse: '',
    role: utilisateur.role || 'client',
    telephone: utilisateur.telephone || '',
  });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur]   = useState('');

  const champ = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');
    try {
      const payload = { ...form };
      if (!estNouveau) delete payload.motDePasse; // pas de changement de mdp depuis cet écran
      const url    = estNouveau ? `${API_URL}/utilisateurs` : `${API_URL}/utilisateurs/${utilisateur.id}`;
      const method = estNouveau ? 'POST' : 'PUT';
      const res  = await fetchAuth(url, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'enregistrement');
      onSaved();
    } catch (err) {
      setErreur(messageErreurApi(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{estNouveau ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}</h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        {erreur && <Erreur message={erreur} />}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input name="prenom" value={form.prenom} onChange={champ} required />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input name="nom" value={form.nom} onChange={champ} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={champ} required />
          </div>
          {estNouveau && (
            <div className="form-group">
              <label>Mot de passe</label>
              <input name="motDePasse" type="password" value={form.motDePasse} onChange={champ} minLength={8} required />
            </div>
          )}
          <div className="admin-form-row">
            <div className="form-group">
              <label>Téléphone</label>
              <input name="telephone" value={form.telephone} onChange={champ} />
            </div>
            <div className="form-group">
              <label>Rôle</label>
              <select name="role" value={form.role} onChange={champ}>
                <option value="client">Client</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
