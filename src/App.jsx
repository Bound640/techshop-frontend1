// ============================================================
// TechShop - Application principale & Routage
// Fichier : src/App.js
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import RouteProtegee from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home          from './pages/Home';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Connexion     from './pages/Connexion';
import Inscription   from './pages/Inscription';
import MesCommandes  from './pages/MesCommandes';
import './styles/global.css';

// Page 404
const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔍</div>
    <h2 style={{ fontSize: '2rem', marginBottom: '.5rem' }}>Page introuvable</h2>
    <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
      La page que vous cherchez n'existe pas ou a été déplacée.
    </p>
    <a href="/" className="btn btn-primary">Retour à l'accueil</a>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Navbar />
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/produits"       element={<Products />} />
              <Route path="/produits/:id"   element={<ProductDetail />} />
              <Route path="/panier"         element={<Cart />} />
              <Route path="/connexion"      element={<Connexion />} />
              <Route path="/inscription"    element={<Inscription />} />
              <Route
                path="/mes-commandes"
                element={<RouteProtegee><MesCommandes /></RouteProtegee>}
              />
              <Route path="*"               element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
