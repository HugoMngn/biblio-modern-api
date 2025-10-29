import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, LoginRequest, RegisterRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  username: string | null;
  fullName: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLibrarian: boolean;
  isMember: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    const storedFullName = localStorage.getItem('fullName');
    if (storedUsername) {
      setUsername(storedUsername);
      setRole(storedRole);
      setFullName(storedFullName);
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await api.login(data);

      // Get full user info including role
      try {
        const userInfo = await api.getUserInfo(data.username);
        const userRole = userInfo.role || 'ROLE_MEMBER';
        const userFullName = userInfo.fullName || data.username;

        localStorage.setItem('username', response.username);
        localStorage.setItem('role', userRole);
        localStorage.setItem('fullName', userFullName);

        setUsername(response.username);
        setRole(userRole);
        setFullName(userFullName);
      } catch (error) {
        // If getUserInfo fails, use basic info from login response
        localStorage.setItem('username', response.username);
        if (response.role) {
          localStorage.setItem('role', response.role);
          setRole(response.role);
        }
        setUsername(response.username);
        setFullName(response.username);
      }

      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${response.username}`,
      });
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: error instanceof Error ? error.message : 'Identifiants invalides',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      await api.register(data);
      toast({
        title: 'Inscription réussie',
        description: 'Vous pouvez maintenant vous connecter',
      });
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    setUsername(null);
    setRole(null);
    setFullName(null);
    toast({
      title: 'Déconnexion',
      description: 'À bientôt !',
    });
  };

  // Helper to check roles with proper hierarchy
  const isAdmin = role === 'ROLE_ADMIN';
  const isLibrarian = role === 'ROLE_LIBRARIAN' || isAdmin;
  const isMember = role === 'ROLE_MEMBER' || isLibrarian;

  return (
    <AuthContext.Provider
      value={{
        username,
        fullName,
        role,
        isAuthenticated: !!username,
        isAdmin,
        isLibrarian,
        isMember,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};