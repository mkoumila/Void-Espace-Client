import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';
import { useEffect, useState } from 'react';

function ProtectedRoute({ requiredRole }) {
  const { user, loading, sessionChecked, hasPermission } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add a timeout for loading to prevent infinite loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setTimeoutReached(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  // Show loading indicator while checking authentication
  if (loading && !timeoutReached) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="ml-2">Chargement...</p>
      </div>
    );
  }

  // If loading takes too long, or session check has happened but no user, redirect to login
  if ((timeoutReached || sessionChecked) && !user) {
    return <Navigate to="/login" replace />;
  }

  // If role check is required and user doesn't have permission, show unauthorized
  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600">Accès non autorisé</h1>
        <p className="mt-2 text-gray-600">Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
      </div>
    );
  }

  // Render the protected content
  return <Outlet />;
}

export default ProtectedRoute; 