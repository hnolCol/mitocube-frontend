import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';


export const ProtectedRoute = ({
    isAuthenticated,
    redirectPath = '/login',
    children }) => 
    // 
  {
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