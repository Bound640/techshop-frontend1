import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL, adapterProduit, adapterCategorie } from '../utils/api';
import { formatPrice } from '../utils/formatPrice';
import ProductCard from '../components/ProductCard';
import './Products.css';

const sortOptions = [
  { value: 'featured',    label: '⭐ Mis en avant' },
  { value: 'price-asc',  label: '💲 Prix croissant' },
  { value: 'price-desc', label: '💲 Prix décroissant' },
  { value: 'rating',     label: '🏆 Meilleures notes' },
  { value: 'name',       label: '🔤 Nom (A-Z)' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy,   setSortBy]   = useState('featured');
  const [priceMax, setPriceMax] = useState(2000000);

  const [categories, setCategories] = useState([]);
  const [marques, setMarques]       = useState([]);
  const [produits, setProduits]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);

  const searchQuery    = searchParams.get('search') || '';
  const activeCategory = searchParams.get('cat')    || '';
  const activeMarque   = searchParams.get('marque') || '';

  // Remonter en haut à l'ouverture
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Charger catégories + marques une fois
  useEffect(() => {
    (async () => {
      try {
        const [resCats, resMarques] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/produits/marques`),
        ]);
        const dataCats = await resCats.json();
        const dataMarques = await resMarques.json();
        setCategories((dataCats.categories || []).map(adapterCategorie));
        setMarques(dataMarques.marques || []);
      } catch { /* silencieux */ }
    })();
  }, []);

  // Charger les produits à chaque changement de filtre
  const chargerProduits = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (activeCategory) {
        const cat = categories.find(c => c.id === activeCategory);
        if (cat) params.set('categorie', cat._id);
      }
      if (activeMarque) params.set('marque', activeMarque);
      if (searchQuery)  params.set('search', searchQuery);
      if (priceMax < 2000000) params.set('maxPrix', String(priceMax));

      const sortMap = {
        'price-asc':  'sortBy=prix&order=asc',
        'price-desc': 'sortBy=prix&order=desc',
        'rating':     'sortBy=note&order=desc',
        'name':       'sortBy=nom&order=asc',
        'featured':   'sortBy=vedette&order=desc',
      };
      const res  = await fetch(`${API_URL}/produits?${params.toString()}&${sortMap[sortBy] || ''}`);
      const data = await res.json();
      setProduits((data.produits || []).map(adapterProduit));
      setTotal(data.total || 0);
    } catch {
      setProduits([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeMarque, searchQuery, priceMax, sortBy, categories]);

  useEffect(() => { chargerProduits(); }, [chargerProduits]);

  const handleCategory = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId === activeCategory) params.delete('cat');
    else params.set('cat', catId);
    setSearchParams(params);
  };

  const handleMarque = (m) => {
    const params = new URLSearchParams(searchParams);
    if (m === activeMarque) params.delete('marque');
    else params.set('marque', m);
    setSearchParams(params);
  };

  const handleSearch = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set('search', val); else params.delete('search');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSortBy('featured');
    setPriceMax(2000000);
  };

  const hasFilters = activeCategory || activeMarque || searchQuery || priceMax < 2000000;

  return (
    <div className="products-page container">

      {/* ---- Sidebar ---------------------------------------- */}
      <aside className="products-sidebar">
        <div className="sidebar-card">
          <h3>🔍 Recherche</h3>
          <input
            type="text"
            placeholder="Nom, marque..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="sidebar-search"
          />
        </div>

        <div className="sidebar-card">
          <h3>📂 Catégories</h3>
          <ul className="sidebar-cats">
            <li>
              <button
                className={`sidebar-cat-btn${!activeCategory ? ' active' : ''}`}
                onClick={() => handleCategory('')}
              >
                Toutes les catégories
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <button
                  className={`sidebar-cat-btn${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => handleCategory(cat.id)}
                >
                  {cat.icon} {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {marques.length > 0 && (
          <div className="sidebar-card">
            <h3>🏷️ Marques</h3>
            <ul className="sidebar-cats">
              {marques.map(m => (
                <li key={m}>
                  <button
                    className={`sidebar-cat-btn${activeMarque === m ? ' active' : ''}`}
                    onClick={() => handleMarque(m)}
                  >
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="sidebar-card">
          <h3>💰 Prix max : {formatPrice(priceMax)}</h3>
          <input
            type="range"
            min="5000" max="2000000" step="5000"
            value={priceMax}
            onChange={e => setPriceMax(Number(e.target.value))}
            className="price-range"
          />
          <div className="price-labels">
            <span>{formatPrice(5000)}</span>
            <span>{formatPrice(2000000)}</span>
          </div>
        </div>

        {hasFilters && (
          <button className="btn btn-secondary btn-full btn-sm" onClick={clearFilters}>
            ✕ Effacer les filtres
          </button>
        )}
      </aside>

      {/* ---- Main ------------------------------------------- */}
      <div className="products-main">
        <div className="products-toolbar">
          <p className="results-count">
            <strong>{total}</strong> produit{total > 1 ? 's' : ''}
            {searchQuery && <span> pour « {searchQuery} »</span>}
            {activeCategory && <span> dans {categories.find(c => c.id === activeCategory)?.label}</span>}
          </p>
          <select
            className="sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}><span className="spinner" /></div>
        ) : produits.length > 0 ? (
          <div className="products-grid-catalog fade-in">
            {produits.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>Aucun produit trouvé</h3>
            <p>Essayez de modifier vos filtres ou votre recherche.</p>
            <button className="btn btn-primary" onClick={clearFilters}>Voir tout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
