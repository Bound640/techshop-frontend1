import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import RouteProtegee from './components/ProtectedRoute';


import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home          from './pages/Home';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Profil from './pages/Profil';
import Connexion     from './pages/Connexion';
import Inscription   from './pages/Inscription';
import MesCommandes  from './pages/MesCommandes';
import MotDePasseOublie from './pages/MotDePasseOublie';
import ReinitialiserMotDePasse from './pages/ReinitialiserMotDePasse';
import Admin from './pages/Admin';
import Support from './pages/Support';
import Favoris from './pages/Favoris';
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

// Page d'accueil : connexion en premier (comme Instagram) —
// si déjà connecté, on entre directement dans l'application
const AccueilOuConnexion = () => {
  const { estConnecte, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderTopColor: '#2563EB', borderColor: '#E5E7EB' }} />
      </div>
    );
  }

  return estConnecte ? <Home /> : <Connexion />;
};

// Chemins où la barre de navigation et le pied de page ne doivent PAS
// s'afficher (écran de connexion/inscription "porte d'entrée", sans les
// distractions du reste du site — comme Instagram)
const CHEMINS_SANS_CHROME = ['/connexion', '/inscription', '/mot-de-passe-oublie'];

const Mise_en_page = ({ children }) => {
  const location = useLocation();
  const { estConnecte } = useAuth();

  const estCheminAuth =
    CHEMINS_SANS_CHROME.includes(location.pathname) ||
    location.pathname.startsWith('/reinitialiser-mot-de-passe');
  const estAccueilNonConnecte = location.pathname === '/' && !estConnecte;
  const masquerChrome = estCheminAuth || estAccueilNonConnecte;

  return (
    <div className="app">
      {!masquerChrome && <Navbar />}
      {children}
      {!masquerChrome && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Mise_en_page>
            <Routes>
              <Route path="/"               element={<AccueilOuConnexion />} />
              <Route path="/produits"       element={<Products />} />
              <Route path="/produits/:id"   element={<ProductDetail />} />
              <Route path="/panier"         element={<Cart />} />
              <Route path="/connexion"      element={<Connexion />} />
              <Route path="/inscription"    element={<Inscription />} />
              <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
              <Route path="/reinitialiser-mot-de-passe/:token" element={<ReinitialiserMotDePasse />} />
              <Route path="/support"        element={<Support />} />
              <Route
                path="/favoris"
                element={<RouteProtegee><Favoris /></RouteProtegee>}
              />

              <Route path="/profil" element={<RouteProtegee><Profil /></RouteProtegee>} />
              <Route
                path="/mes-commandes"
                element={<RouteProtegee><MesCommandes /></RouteProtegee>}

              />
              <Route
                path="/admin"
                element={<RouteProtegee adminRequis><Admin /></RouteProtegee>}
              />
              <Route path="*"               element={<NotFound />} />
            </Routes>
          </Mise_en_page>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;