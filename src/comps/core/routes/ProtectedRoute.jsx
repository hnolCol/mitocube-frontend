import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';


export function ProtectedRoute({
    isAuthenticated,
    redirectPath = '/',
  children }) {
   const location = useLocation()
    if (!isAuthenticated) {
      return <Navigate to={location} replace />;
    }
  
    return <>{children}</>;
  };

ProtectedRoute.propTypes = {
  isAuthenticated: PropTypes.bool,
  redirectPath: PropTypes.string,
  children : PropTypes.element
}


export function ProtectedAdminRoute({
  isAuthenticated,
  isAdmin,
  redirectPath = '/',
  children }) {
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

ProtectedRoute.propTypes = {
isAuthenticated: PropTypes.bool,
redirectPath: PropTypes.string,
children : PropTypes.element
}