import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';


export function ProtectedRoute({
    isAuthenticated,
    redirectPath = '/',
    children }) {
    if (!isAuthenticated) {
      return <Navigate to={redirectPath} replace />;
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