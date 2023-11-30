import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../base/loading';


export function ProtectedRoute({
  isAuthenticated,
  isLoadingToken,
  redirectPath = '/',
  children }) {
  if (!isAuthenticated && !isLoadingToken) {
      return <Navigate to={redirectPath} replace />;
  }
  
  if (isLoadingToken) return <Loading />
  
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
  console.log(redirectPath)
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