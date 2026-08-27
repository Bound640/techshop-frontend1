// ============================================================
// TechShop - Protection de routes (auth requise / admin requis)
// Fichier : src/components/ProtectedRoute.js
// ============================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RouteProtegee = ({ children, adminRequis = false }) => {
  const { estConnecte, estAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderTopColor: '#2563EB', borderColor: '#E5E7EB' }} />
      </div>
    );
  }

  if (!estConnecte) {
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  }

  if (adminRequis && !estAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RouteProtegee;
