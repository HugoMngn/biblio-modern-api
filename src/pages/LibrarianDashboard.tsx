import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Loan, Book } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ClipboardCheck, Plus, Edit, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const LibrarianDashboard = () => {
  const { isLibrarian, isAdmin, username } = useAuth();
  const { toast } = useToast();
  
  const [pendingLoans, setPendingLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  // Form states for new book
  const [newBook, setNewBook] = useState<Book>({
    title: '',
    author: '',
    genre: '',
    isbn: '',
  });

  if (!isLibrarian && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadPendingLoans();
    loadBooks();
  }, []);

  const loadPendingLoans = async () => {
    try {
      // TODO: Backend endpoint needed - GET /api/loans/pending
      const loans = await api.getPendingLoans();
      setPendingLoans(loans);
    } catch (error) {
      console.log('Erreur chargement emprunts en attente:', error);
    }
  };

  const loadBooks = async () => {
    try {
      const result = await api.searchBooks({});
      setBooks(result);
    } catch (error) {
      console.log('Erreur chargement livres:', error);
    }
  };

  const handleApproveLoan = async (loanId: number) => {
    setLoading(true);
    try {
      await api.approveLoan(loanId, username || '');
      toast({
        title: 'Emprunt approuvé',
        description: 'L\'emprunt a été validé avec succès',
      });
      loadPendingLoans();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible d\'approuver l\'emprunt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.addBook(newBook);
      toast({
        title: 'Livre ajouté',
        description: 'Le livre a été ajouté au catalogue',
      });
      setNewBook({ title: '', author: '', genre: '', isbn: '' });
      loadBooks();
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

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook?.id) return;
    
    setLoading(true);
    try {
      // TODO: Backend endpoint needed - PUT /api/books/{id}
      await api.updateBook(editingBook.id, editingBook);
      toast({
        title: 'Livre modifié',
        description: 'Les informations du livre ont été mises à jour',
      });
      setEditingBook(null);
      loadBooks();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de modifier le livre',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return;
    
    setLoading(true);
    try {
      // TODO: Backend endpoint needed - DELETE /api/books/{id}
      await api.deleteBook(bookId);
      toast({
        title: 'Livre supprimé',
        description: 'Le livre a été retiré du catalogue',
      });
      loadBooks();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de supprimer le livre',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Espace Bibliothécaire</h1>
        </div>

        <Tabs defaultValue="loans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="loans">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Emprunts en attente
            </TabsTrigger>
            <TabsTrigger value="books">
              <BookOpen className="w-4 h-4 mr-2" />
              Gestion du catalogue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>Emprunts en attente d'approbation</CardTitle>
                <CardDescription>
                  Validez ou refusez les demandes d'emprunt
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingLoans.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun emprunt en attente
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingLoans.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">Utilisateur: {loan.username}</p>
                          <p className="text-sm text-muted-foreground">Livre ID: {loan.bookId}</p>
                          <p className="text-sm text-muted-foreground">Statut: {loan.status}</p>
                        </div>
                        <Button onClick={() => loan.id && handleApproveLoan(loan.id)} disabled={loading}>
                          Approuver
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="books">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Ajouter un nouveau livre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBook} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Titre</Label>
                        <Input
                          id="title"
                          value={newBook.title}
                          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="author">Auteur</Label>
                        <Input
                          id="author"
                          value={newBook.author}
                          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="genre">Genre</Label>
                        <Input
                          id="genre"
                          value={newBook.genre}
                          onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="isbn">ISBN</Label>
                        <Input
                          id="isbn"
                          value={newBook.isbn}
                          onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading}>
                      Ajouter le livre
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Catalogue des livres</CardTitle>
                  <CardDescription>
                    Modifiez ou supprimez des livres du catalogue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {books.map((book) => (
                      <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{book.title}</p>
                          <p className="text-sm text-muted-foreground">{book.author} - {book.genre}</p>
                          <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingBook(book)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Modifier le livre</DialogTitle>
                                <DialogDescription>
                                  Modifiez les informations du livre
                                </DialogDescription>
                              </DialogHeader>
                              {editingBook && (
                                <form onSubmit={handleUpdateBook} className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-title">Titre</Label>
                                    <Input
                                      id="edit-title"
                                      value={editingBook.title}
                                      onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-author">Auteur</Label>
                                    <Input
                                      id="edit-author"
                                      value={editingBook.author}
                                      onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-genre">Genre</Label>
                                    <Input
                                      id="edit-genre"
                                      value={editingBook.genre}
                                      onChange={(e) => setEditingBook({ ...editingBook, genre: e.target.value })}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-isbn">ISBN</Label>
                                    <Input
                                      id="edit-isbn"
                                      value={editingBook.isbn}
                                      onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                                    />
                                  </div>
                                  <Button type="submit" disabled={loading}>
                                    Enregistrer
                                  </Button>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => book.id && handleDeleteBook(book.id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
