import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, LoginRequest, RegisterRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  username: string | null;
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
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    if (storedUsername) {
      setUsername(storedUsername);
      setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await api.login(data);
      localStorage.setItem('username', response.username);
      if (response.role) {
        localStorage.setItem('role', response.role);
        setRole(response.role);
      }
      setUsername(response.username);
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
    setUsername(null);
    setRole(null);
    toast({
      title: 'Déconnexion',
      description: 'À bientôt !',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        role,
        isAuthenticated: !!username,
        isAdmin: role === 'ROLE_ADMIN',
        isLibrarian: role === 'ROLE_LIBRARIAN',
        isMember: role === 'ROLE_MEMBER',
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
