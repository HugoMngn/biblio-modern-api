import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Book } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookPlus, BookOpen } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

// Librarian dashboard for adding books and managing catalog
const LibrarianDashboard = () => {
  const { isLibrarian } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle add book form submission
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const book: Book = {
        title,
        author,
        genre,
        isbn: isbn || undefined,
        available: true,
      };
      await api.addBook(book);
      toast({
        title: 'Livre ajouté',
        description: `"${title}" a été ajouté au catalogue`,
      });
      setTitle('');
      setAuthor('');
      setGenre('');
      setIsbn('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible d\'ajouter le livre',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLibrarian) {
    return <Navigate to="/" replace />;
  }

  // Main render
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Espace Bibliothécaire</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookPlus className="w-5 h-5" />
                Ajouter un livre au catalogue
              </CardTitle>
              <CardDescription>
                Complétez les informations du livre à ajouter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBook} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Le Petit Prince"
                  />
                </div>

                <div>
                  <Label htmlFor="author">Auteur</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    placeholder="Antoine de Saint-Exupéry"
                  />
                </div>

                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    required
                    placeholder="Fiction"
                  />
                </div>

                <div>
                  <Label htmlFor="isbn">ISBN (optionnel)</Label>
                  <Input
                    id="isbn"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-2-07-061275-8"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Ajout en cours...' : 'Ajouter le livre'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestion du catalogue</CardTitle>
              <CardDescription>
                Consultez et modifiez les livres existants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/catalog">
                <Button className="w-full">
                  Accéder au catalogue complet
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboard;