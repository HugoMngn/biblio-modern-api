import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Home page with hero and features sections
const Home = () => {
  const { isAuthenticated } = useAuth();

  // Main render
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-24 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Votre bibliothèque ModernaTo
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 text-balance">
            Découvrez, empruntez et gérez vos lectures en toute simplicité
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {isAuthenticated ? (
              <Link to="/catalog">
                <Button variant="hero" size="lg" className="bg-accent hover:bg-accent/90">
                  <Search className="h-5 w-5" />
                  Explorer le catalogue
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth?mode=register">
                  <Button variant="hero" size="lg" className="bg-accent hover:bg-accent/90">
                    Commencer gratuitement
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
                    Se connecter
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Une expérience de lecture enrichie
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg gradient-card shadow-elegant hover:shadow-hover transition-smooth">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Catalogue riche</h3>
              <p className="text-muted-foreground">
                Accédez à une collection variée de livres dans tous les genres
              </p>
            </div>

            <div className="text-center p-6 rounded-lg gradient-card shadow-elegant hover:shadow-hover transition-smooth">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Recherche avancée</h3>
              <p className="text-muted-foreground">
                Trouvez rapidement vos livres par titre, auteur ou genre
              </p>
            </div>

            <div className="text-center p-6 rounded-lg gradient-card shadow-elegant hover:shadow-hover transition-smooth">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gestion simplifiée</h3>
              <p className="text-muted-foreground">
                Suivez vos emprunts et dates de retour facilement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à commencer votre voyage littéraire ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Rejoignez notre communauté de lecteurs passionnés
            </p>
            <Link to="/auth?mode=register">
              <Button variant="hero" size="lg">
                Créer mon compte
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
