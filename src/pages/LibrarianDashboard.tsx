import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Book } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookPlus, BookOpen, Pencil, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

// Librarian dashboard for adding books and managing catalog
const LibrarianDashboard = () => {
  const { isLibrarian } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);

  // Book list state
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{ open: boolean; book: Book | null }>({
    open: false,
    book: null,
  });
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editIsbn, setEditIsbn] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; book: Book | null }>({
    open: false,
    book: null,
  });

  useEffect(() => {
    loadBooks();
  }, []);

  // Load all books
  const loadBooks = async () => {
    try {
      setLoadingBooks(true);
      const data = await api.searchBooks({});
      setBooks(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de charger les livres',
        variant: 'destructive',
      });
    } finally {
      setLoadingBooks(false);
    }
  };

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
      loadBooks(); // Reload books list
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : "Impossible d'ajouter le livre",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (book: Book) => {
    setEditDialog({ open: true, book });
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditGenre(book.genre);
    setEditIsbn(book.isbn || '');
    setEditAvailable(book.available ?? true);
  };

  // Handle edit book
  const handleEditBook = async () => {
    if (!editDialog.book?.id) return;

    try {
      const updatedBook: Book = {
        ...editDialog.book,
        title: editTitle,
        author: editAuthor,
        genre: editGenre,
        isbn: editIsbn || undefined,
        available: editAvailable,
      };
      await api.updateBook(editDialog.book.id, updatedBook);
      toast({
        title: 'Livre modifié',
        description: `"${editTitle}" a été mis à jour`,
      });
      setEditDialog({ open: false, book: null });
      loadBooks(); // Reload books list
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de modifier le livre',
        variant: 'destructive',
      });
    }
  };

  // Handle delete book
  const handleDeleteBook = async () => {
    if (!deleteDialog.book?.id) return;

    try {
      await api.deleteBook(deleteDialog.book.id);
      toast({
        title: 'Livre supprimé',
        description: `"${deleteDialog.book.title}" a été supprimé du catalogue`,
      });
      setDeleteDialog({ open: false, book: null });
      loadBooks(); // Reload books list
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de supprimer le livre',
        variant: 'destructive',
      });
    }
  };

  if (!isLibrarian) {
    return <Navigate to="/" replace />;
  }

  // Main render
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Espace Bibliothécaire</h1>
        </div>

        <div className="grid gap-6">
          {/* Add Book Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookPlus className="w-5 h-5" />
                Ajouter un livre au catalogue
              </CardTitle>
              <CardDescription>Complétez les informations du livre à ajouter</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBook} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Ajout en cours...' : 'Ajouter le livre'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Books List Card */}
          <Card>
            <CardHeader>
              <CardTitle>Catalogue complet</CardTitle>
              <CardDescription>
                Gérez tous les livres du catalogue - {books.length} livre(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBooks ? (
                <p className="text-muted-foreground">Chargement...</p>
              ) : books.length === 0 ? (
                <p className="text-muted-foreground">Aucun livre dans le catalogue</p>
              ) : (
                <div className="space-y-3">
                  {books.map((book) => (
                    <Card key={book.id} className="overflow-hidden">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">{book.title}</h3>
                              <Badge variant={book.available ? 'default' : 'secondary'}>
                                {book.available ? 'Disponible' : 'Emprunté'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Par {book.author}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Genre: {book.genre}
                              {book.isbn && ` • ISBN: ${book.isbn}`}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(book)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setDeleteDialog({ open: true, book })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, book: null })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le livre</DialogTitle>
            <DialogDescription>
              Modifiez les informations du livre "{editDialog.book?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-title">Titre</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-author">Auteur</Label>
              <Input
                id="edit-author"
                value={editAuthor}
                onChange={(e) => setEditAuthor(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-genre">Genre</Label>
              <Input
                id="edit-genre"
                value={editGenre}
                onChange={(e) => setEditGenre(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-isbn">ISBN</Label>
              <Input
                id="edit-isbn"
                value={editIsbn}
                onChange={(e) => setEditIsbn(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-available"
                checked={editAvailable}
                onChange={(e) => setEditAvailable(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-available">Disponible</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, book: null })}>
              Annuler
            </Button>
            <Button onClick={handleEditBook}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, book: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le livre "{deleteDialog.book?.title}" sera
              définitivement supprimé du catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBook}
              className="bg-destructive text-destructive-foreground"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LibrarianDashboard;
