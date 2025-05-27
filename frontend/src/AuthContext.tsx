import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface User {
  name: string; 
  stravaId: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  sex?: string; 
  city?: string;
  state?: string;
  country?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  checkAuthStatus: (triggerLogoutOn401?: boolean) => Promise<void>;
  logout: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async (triggerLogoutOn401: boolean = false) => { 
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/me', {
        headers: {
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        if (response.status === 401 && triggerLogoutOn401) {
          setUser(null);
          setIsAuthenticated(false);
        } else if (response.status !== 401) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);

  };

  useEffect(() => {
    checkAuthStatus(); 
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, checkAuthStatus, logout }}>
      {!isLoading ? children : <div>Loading session...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};