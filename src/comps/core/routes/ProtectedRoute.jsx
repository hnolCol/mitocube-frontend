import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router';
import Loading from '../base/loading';


export function ProtectedRoute({
  isAuthenticated,
  isLoadingToken,
  redirectPath = '/',
  children
}) {
  const location = useLocation();

  if (!isAuthenticated && !isLoadingToken) {
    // Preserve search params and hash when redirecting
    const to =
      typeof redirectPath === 'string'
        ? {
            pathname: redirectPath,
            search: location.search,
            hash: location.hash,
          }
        : redirectPath;
    return <Navigate to={to} replace />;
  }

  if (isLoadingToken) return <Loading />;

  return <>{children}</>;
}

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