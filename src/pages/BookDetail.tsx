import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Book } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowLeft, Loader2 } from 'lucide-react';

// Book detail page with borrow functionality
const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, username } = useAuth();
  const { toast } = useToast();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (id) {
      loadBook(parseInt(id));
    }
  }, [id, isAuthenticated, navigate]);

  // Load book details by ID
  const loadBook = async (bookId: number) => {
    setIsLoading(true);
    try {
      const data = await api.getBookById(bookId);
      setBook(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Livre introuvable',
        variant: 'destructive',
      });
      navigate('/catalog');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle borrow book action
  const handleBorrow = async () => {
    if (!username || !book?.id) return;

    setIsBorrowing(true);
    try {
      await api.requestLoan(username, book.id);
      toast({
        title: 'Demande envoyée',
        description: "Votre demande d'emprunt a été enregistrée",
      });
      navigate('/my-loans');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : "Impossible d'emprunter ce livre",
        variant: 'destructive',
      });
    } finally {
      setIsBorrowing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!book) return null;

  // Main render
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/catalog')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au catalogue
        </Button>

        <Card className="p-8 gradient-card shadow-elegant">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-48 flex-shrink-0">
              <div className="aspect-[3/4] bg-accent/20 rounded-lg flex items-center justify-center">
                <BookOpen className="h-20 w-20 text-accent" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{book.title}</h1>

              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <Badge variant={book.available ? 'default' : 'secondary'} className="text-sm">
                  {book.available ? 'Disponible' : 'Emprunté'}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {book.genre}
                </Badge>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Auteur
                  </h3>
                  <p className="text-lg">{book.author}</p>
                </div>

                {book.isbn && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      ISBN
                    </h3>
                    <p className="text-lg font-mono">{book.isbn}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Genre
                  </h3>
                  <p className="text-lg">{book.genre}</p>
                </div>
              </div>

              {book.available && (
                <Button
                  onClick={handleBorrow}
                  disabled={isBorrowing}
                  size="lg"
                  variant="hero"
                >
                  {isBorrowing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Emprunt en cours...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-5 w-5" />
                      Emprunter ce livre
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BookDetail;
