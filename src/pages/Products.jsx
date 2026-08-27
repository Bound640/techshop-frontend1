// ============================================================
// TechShop - Catalogue Produits
// Fichier : src/pages/Products.js
// ============================================================

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products, categories } from '../data/products';
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
  const [sortBy,  setSortBy]  = useState('featured');
  const [priceMax, setPriceMax] = useState(2000000);

  const searchQuery  = searchParams.get('search') || '';
  const activeCategory = searchParams.get('cat')  || '';

  // Remonter en haut à l'ouverture
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleCategory = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId === activeCategory) {
      params.delete('cat');
    } else {
      params.set('cat', catId);
    }
    params.delete('search');
    setSearchParams(params);
  };

  const handleSearch = (val) => {
    const params = new URLSearchParams();
    if (val) params.set('search', val);
    setSearchParams(params);
  };

  // Filtrage + tri
  const filtered = useMemo(() => {
    let res = [...products];
    if (activeCategory) res = res.filter(p => p.category === activeCategory);
    if (searchQuery)    res = res.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    res = res.filter(p => p.price <= priceMax);

    switch (sortBy) {
      case 'price-asc':  return res.sort((a, b) => a.price - b.price);
      case 'price-desc': return res.sort((a, b) => b.price - a.price);
      case 'rating':     return res.sort((a, b) => b.rating - a.rating);
      case 'name':       return res.sort((a, b) => a.name.localeCompare(b.name));
      default:           return res;
    }
  }, [activeCategory, searchQuery, sortBy, priceMax]);

  const clearFilters = () => {
    setSearchParams({});
    setSortBy('featured');
    setPriceMax(2000000);
  };

  const hasFilters = activeCategory || searchQuery || priceMax < 2000000;

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
                <span>{products.length}</span>
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <button
                  className={`sidebar-cat-btn${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => handleCategory(cat.id)}
                >
                  {cat.icon} {cat.label}
                  <span>{products.filter(p => p.category === cat.id).length}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-card">
          <h3>💰 Prix max : {formatPrice(priceMax)}</h3>
          <input
            type="range"
            min="50000" max="2000000" step="25000"
            value={priceMax}
            onChange={e => setPriceMax(Number(e.target.value))}
            className="price-range"
          />
          <div className="price-labels">
            <span>{formatPrice(50000)}</span>
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
        {/* Barre de résultats */}
        <div className="products-toolbar">
          <p className="results-count">
            <strong>{filtered.length}</strong> produit{filtered.length > 1 ? 's' : ''}
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

        {/* Grille */}
        {filtered.length > 0 ? (
          <div className="products-grid-catalog fade-in">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
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
