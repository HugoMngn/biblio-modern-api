import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, Search, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, username } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elegant">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="h-6 w-6 text-accent transition-smooth group-hover:scale-110" />
          <span className="font-bold text-xl">BiblioModerne</span>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-6">
            <Link
              to="/catalog"
              className={`flex items-center gap-2 transition-smooth hover:text-accent ${
                isActive('/catalog') ? 'text-accent font-semibold' : 'text-foreground'
              }`}
            >
              <Search className="h-4 w-4" />
              Catalogue
            </Link>
            <Link
              to="/my-loans"
              className={`flex items-center gap-2 transition-smooth hover:text-accent ${
                isActive('/my-loans') ? 'text-accent font-semibold' : 'text-foreground'
              }`}
            >
              <BookMarked className="h-4 w-4" />
              Mes emprunts
            </Link>
            
            <div className="flex items-center gap-3 ml-4 pl-4 border-l">
              <span className="text-sm text-muted-foreground">{username}</span>
              <Button onClick={logout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button variant="hero">Inscription</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
