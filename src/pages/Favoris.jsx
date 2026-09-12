import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL, adapterProduit } from '../utils/api';
import { messageErreurApi } from '../utils/apiError';
import ProductCard from '../components/ProductCard';

const Favoris = () => {
  const { fetchAuth } = useAuth();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [erreur, setErreur]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetchAuth(`${API_URL}/auth/favoris`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProduits((data.favoris || []).map(adapterProduit));
      } catch (err) {
        setErreur(messageErreurApi(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  return (
    <div className="products-page container" style={{ gridTemplateColumns: '1fr' }}>
      <div className="products-main" style={{ width: '100%' }}>
        <div className="products-toolbar">
          <h1 style={{ fontSize: '1.4rem' }}>❤️ Mes favoris</h1>
        </div>

        {erreur && <div className="auth-alert auth-alert--error">⚠️ {erreur}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}><span className="spinner" /></div>
        ) : produits.length > 0 ? (
          <div className="products-grid-catalog fade-in">
            {produits.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">🤍</div>
            <h3>Aucun favori pour le moment</h3>
            <p>Ajoutez des produits à vos favoris en cliquant sur le cœur.</p>
            <Link to="/produits" className="btn btn-primary">Voir le catalogue</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoris;
