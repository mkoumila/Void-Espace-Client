import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import supabaseClient from './supabaseClient';

// Create the AuthContext
const AuthContext = createContext();

// Create a provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionRecoveryAttempted, setSessionRecoveryAttempted] = useState(false);
  const navigate = useNavigate();

  // Function to get user role from database
  const getUserRole = async (userId) => {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        // Check localStorage for cached role as fallback
        try {
          const cachedUserData = localStorage.getItem('espace-client-user-data');
          if (cachedUserData) {
            const parsedData = JSON.parse(cachedUserData);
            if (parsedData.role) {
              setUserRole(parsedData.role);
              return parsedData.role;
            }
          }
        } catch (e) {
          // Fallback silently
        }
        
        // Always set a role even if there's an error
        setUserRole('client');
        return 'client';
      }

      // Cache the role in localStorage for future use
      try {
        localStorage.setItem('espace-client-user-data', JSON.stringify({ 
          role: data?.role || 'client',
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        // Cache error - ignore
      }

      const role = data?.role || 'client';
      setUserRole(role);
      return role;
    } catch (error) {
      // Same localStorage fallback as above
      try {
        const cachedUserData = localStorage.getItem('espace-client-user-data');
        if (cachedUserData) {
          const parsedData = JSON.parse(cachedUserData);
          if (parsedData.role) {
            setUserRole(parsedData.role);
            return parsedData.role;
          }
        }
      } catch (e) {
        // Fallback silently
      }
      
      // Always set a role even if there's an exception
      setUserRole('client');
      return 'client';
    }
  };

  // Force refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabaseClient.auth.refreshSession();
      return !error;
    } catch (error) {
      return false;
    }
  };

  // Check for user session on mount
  useEffect(() => {
    let sessionTimeoutId;
    
    const getSession = async () => {
      if (sessionRecoveryAttempted) {
        return; // Don't try multiple times
      }
      
      setSessionRecoveryAttempted(true);
      setLoading(true);
      
      // Set a timeout to prevent infinite loading
      sessionTimeoutId = setTimeout(() => {
        if (user) {
          setUserRole('client');
        }
        
        setLoading(false);
        setSessionChecked(true);
      }, 5000);
      
      try {
        // First try to refresh the session
        await refreshSession();
        
        // Then get the current session
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          setAuthError(`Session error: ${error.message}`);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          setSessionChecked(true);
          return;
        }
        
        if (data?.session?.user) {
          setUser(data.session.user);
          setSessionChecked(true);
          
          // Try to get user role
          getUserRole(data.session.user.id).catch(() => {
            setUserRole('client');
          });
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        setAuthError(`Session exception: ${error.message}`);
        
        // Try to recover from stored session directly
        try {
          const storedSession = localStorage.getItem('espace-client-auth');
          if (storedSession) {
            const parsedSession = JSON.parse(storedSession);
            if (parsedSession?.user) {
              setUser(parsedSession.user);
              setUserRole('client');
              
              // Try to get cached role
              try {
                const cachedUserData = localStorage.getItem('espace-client-user-data');
                if (cachedUserData) {
                  const parsedData = JSON.parse(cachedUserData);
                  if (parsedData.role) {
                    setUserRole(parsedData.role);
                  }
                }
              } catch (e) {
                // Ignore recovery errors
              }
            }
          }
        } catch (localStorageError) {
          setUser(null);
          setUserRole(null);
        }
      } finally {
        clearTimeout(sessionTimeoutId);
        setLoading(false);
        setSessionChecked(true);
      }
    };

    getSession();

    // Subscribe to auth changes
    const { data: subscription } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setLoading(true);
        
        if (session?.user) {
          setUser(session.user);
          
          // Set a default role immediately
          if (!userRole) {
            setUserRole('client');
          }
          
          // Then try to get the actual role
          getUserRole(session.user.id).catch(() => {
            // Silent fallback handled already
          });
        } else {
          setUser(null);
          setUserRole(null);
        }
        
        setLoading(false);
        setSessionChecked(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        setSessionChecked(true);
      }
    });

    return () => {
      clearTimeout(sessionTimeoutId);
      subscription?.subscription?.unsubscribe();
    };
  }, [sessionRecoveryAttempted, user, userRole]);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(`Login error: ${error.message}`);
        setLoading(false);
        return { success: false, error: error.message };
      }

      // Manually set the user to update state immediately
      if (data?.user) {
        setUser(data.user);
        
        try {
          const role = await getUserRole(data.user.id);
          setUserRole(role);
        } catch (roleError) {
          setUserRole('client'); // Fallback to client role
        }
      }
      
      setLoading(false);
      return { success: true, data };
    } catch (error) {
      setAuthError(`Login exception: ${error.message}`);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        setAuthError(`Logout error: ${error.message}`);
        throw error;
      }
      
      // Clear session data
      setUser(null);
      setUserRole(null);
      
      // Clear localStorage manually as an extra precaution
      try {
        localStorage.removeItem('espace-client-auth');
      } catch (e) {
        // Ignore clearing errors
      }
      
      navigate('/login');
    } catch (error) {
      setAuthError(`Logout exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if user has specific permission
  const hasPermission = (requiredRole) => {
    if (!userRole) return false;
    
    if (requiredRole === 'admin') {
      return userRole === 'admin';
    }
    
    // Admin has all client permissions
    if (requiredRole === 'client') {
      return userRole === 'client' || userRole === 'admin';
    }
    
    return false;
  };

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        authError,
        sessionChecked,
        login,
        logout,
        hasPermission,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 