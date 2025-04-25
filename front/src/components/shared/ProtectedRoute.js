import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const storedToken = localStorage.getItem('token');

  if (!isAuthenticated || !token || !storedToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;