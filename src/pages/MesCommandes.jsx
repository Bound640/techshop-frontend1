// ============================================================
// TechShop — Historique des commandes du client connecté
// Fichier : src/pages/MesCommandes.js
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import './MesCommandes.css';

// const API_URL = 'http://localhost:3001/api';
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const statutLabel = {
  en_attente:     { label: 'En attente',     color: 'amber' },
  confirmee:      { label: 'Confirmée',      color: 'blue'  },
  en_preparation: { label: 'En préparation', color: 'blue'  },
  expediee:       { label: 'Expédiée',       color: 'purple'},
  livree:         { label: 'Livrée',         color: 'green' },
  annulee:        { label: 'Annulée',        color: 'red'   },
};

const MesCommandes = () => {
  const { fetchAuth } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [erreur,    setErreur]    = useState('');

  useEffect(() => {
    const charger = async () => {
      try {
        const res  = await fetchAuth(`${API_URL}/commandes/mes-commandes`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCommandes(data.commandes);
      } catch (err) {
        setErreur(err.message || 'Erreur lors du chargement des commandes.');
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []); // eslint-disable-line

  if (loading) {
    return <div className="page-loader"><span className="spinner-lg" /></div>;
  }

  if (erreur) {
    return (
      <div className="container empty-state">
        <div className="icon">⚠️</div>
        <h3>Erreur</h3>
        <p>{erreur}</p>
      </div>
    );
  }

  if (commandes.length === 0) {
    return (
      <div className="container empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="icon">📦</div>
        <h3>Aucune commande pour l'instant</h3>
        <p>Vos futures commandes apparaîtront ici.</p>
        <Link to="/produits" className="btn btn-primary" style={{ marginTop: '1.2rem' }}>
          Découvrir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container mes-commandes">
      <h1 className="mc-title">📦 Mes Commandes</h1>

      <div className="mc-list">
        {commandes.map(cmd => {
          const st = statutLabel[cmd.statut] || statutLabel.en_attente;
          return (
            <div className="mc-card" key={cmd._id}>
              <div className="mc-card__header">
                <div>
                  <p className="mc-numero">Commande {cmd.numero}</p>
                  <p className="mc-date">
                    {new Date(cmd.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`mc-statut mc-statut--${st.color}`}>{st.label}</span>
              </div>

              <div className="mc-card__items">
                {cmd.lignes.map((l, i) => (
                  <div className="mc-item" key={i}>
                    {l.imageProduit && <img src={l.imageProduit} alt={l.nomProduit} />}
                    <span className="mc-item-name">{l.nomProduit}</span>
                    <span className="mc-item-qty">×{l.quantite}</span>
                    <span className="mc-item-price">
                      {formatPrice(l.quantite * l.prixUnitaire)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mc-card__footer">
                <span>Total</span>
                <strong>{formatPrice(cmd.total)}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MesCommandes;
