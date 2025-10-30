import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2 } from 'lucide-react';
import BookCard from '@/components/BookCard';
import { api, Book } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Catalog page with search and borrow functionality
const Catalog = () => {
  const { isAuthenticated, username } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [borrowingBookId, setBorrowingBookId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadBooks();
  }, [isAuthenticated, navigate]);

  // Load books with optional search parameters
  const loadBooks = async (params = {}) => {
    setIsLoading(true);
    try {
      const results = await api.searchBooks(params);
      setBooks(results);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les livres',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadBooks();
      return;
    }

    const params: any = {};
    params[searchType] = searchQuery;
    loadBooks(params);
  };

  // Handle borrow book action
  const handleBorrow = async (bookId: number) => {
    if (!username) return;

    setBorrowingBookId(bookId);
    try {
      await api.requestLoan(username, bookId);
      toast({
        title: 'Demande envoyée',
        description: "Votre demande d'emprunt a été enregistrée",
      });
      loadBooks();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : "Impossible d'emprunter ce livre",
        variant: 'destructive',
      });
    } finally {
      setBorrowingBookId(null);
    }
  };

  // Main render
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Catalogue de la bibliothèque</h1>

        {/* Search Section */}
        <div className="gradient-card p-6 rounded-lg shadow-elegant mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder={`Rechercher par ${searchType === 'title'
                        ? 'titre'
                        : searchType === 'author'
                          ? 'auteur'
                          : 'genre'
                      }...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full md:w-48">
                <Label htmlFor="search-type">Type de recherche</Label>
                <Tabs
                  value={searchType}
                  onValueChange={setSearchType}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="title">Titre</TabsTrigger>
                    <TabsTrigger value="author">Auteur</TabsTrigger>
                    <TabsTrigger value="genre">Genre</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Rechercher
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  loadBooks();
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </form>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">Aucun livre trouvé</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBorrow={handleBorrow}
                isLoading={borrowingBookId === book.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
