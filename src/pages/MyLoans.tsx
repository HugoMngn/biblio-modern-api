import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Loan } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookMarked, Clock, CheckCircle, Calendar, Book as BookIcon, ArrowLeft } from 'lucide-react';
import { Navigate } from 'react-router-dom';

// My Loans page displaying user's current and past loans
interface ExtendedLoan extends Loan {
  bookTitle?: string;
  bookAuthor?: string;
  bookGenre?: string;
}

// My Loans page displaying user's current and past loans
const MyLoans = () => {
  const { username, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loans, setLoans] = useState<ExtendedLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      loadLoans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Load user's loans from the API
  const loadLoans = async () => {
    if (!username) return;

    try {
      setLoading(true);
      const data = await api.getMyLoans(username);
      // The backend now returns loans with embedded book data
      setLoans(data);
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description: (error as { message?: string }).message || 'Impossible de charger vos emprunts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle return book action
  const handleReturn = async (loanId: number) => {
    if (!username) return;

    try {
      await api.returnBook(loanId, username);
      toast({
        title: 'Succès',
        description: 'Livre retourné avec succès',
      });
      loadLoans();
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description: (error as { message?: string }).message || 'Impossible de retourner le livre',
        variant: 'destructive',
      });
    }
  };

  // Get status badge based on loan status
  const getStatusBadge = (loan: ExtendedLoan) => {
    if (loan.returnDate) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Retourné
        </Badge>
      );
    }

    if (loan.approved === false) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          En attente d'approbation
        </Badge>
      );
    }

    // Check if overdue
    if (loan.dueDate && new Date(loan.dueDate) < new Date() && !loan.returnDate) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          <Clock className="w-3 h-3 mr-1" />
          En retard
        </Badge>
      );
    }

    // Approved and not yet returned
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        En cours
      </Badge>
    );
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Check if loan is overdue
  const isOverdue = (loan: ExtendedLoan) => {
    return loan.dueDate && new Date(loan.dueDate) < new Date() && !loan.returnDate;
  };

  // Main render
  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookMarked className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Mes Emprunts</h1>
        </div>

        {loans.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <BookMarked className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun emprunt en cours</h3>
              <p className="text-muted-foreground mb-6">
                Explorez notre catalogue pour emprunter des livres
              </p>
              <Button onClick={() => window.location.href = '/catalog'}>
                Parcourir le catalogue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <Card
                key={loan.id}
                className={`hover:shadow-lg transition-shadow ${isOverdue(loan) ? 'border-red-300 border-2' : ''
                  }`}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-4">
                        <BookIcon className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {loan.bookTitle || `Livre #${loan.bookId}`}
                          </h3>
                          {loan.bookAuthor && (
                            <p className="text-sm text-muted-foreground">
                              Par {loan.bookAuthor}
                            </p>
                          )}
                          {loan.bookGenre && (
                            <Badge variant="secondary" className="mt-1">
                              {loan.bookGenre}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Emprunté le: {formatDate(loan.loanDate)}</span>
                        </div>

                        {loan.dueDate && (
                          <div className={`flex items-center gap-2 ${isOverdue(loan) ? 'text-red-600 font-semibold' : 'text-muted-foreground'
                            }`}>
                            <Calendar className="w-4 h-4" />
                            <span>
                              {isOverdue(loan) ? 'RETARD - ' : ''}
                              À rendre le: {formatDate(loan.dueDate)}
                            </span>
                          </div>
                        )}

                        {loan.returnDate && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Retourné le: {formatDate(loan.returnDate)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Statut:</span>
                        {getStatusBadge(loan)}
                      </div>

                      {isOverdue(loan) && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-800 font-medium">
                            ⚠️ Ce livre est en retard. Veuillez le retourner au plus vite.
                          </p>
                        </div>
                      )}
                    </div>

                    {loan.approved === true && !loan.returnDate && (
                      <Button
                        onClick={() => loan.id && handleReturn(loan.id)}
                        variant="outline"
                        className="shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retourner
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Les emprunts doivent être approuvés par un bibliothécaire</p>
            <p>• La durée d'emprunt standard est de 2 semaines</p>
            <p>• Pensez à retourner vos livres à temps pour éviter les pénalités</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyLoans;