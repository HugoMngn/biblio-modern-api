import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api, Loan } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookMarked, Calendar, Loader2 } from 'lucide-react';

const MyLoans = () => {
  const { isAuthenticated, username } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [returningLoanId, setReturningLoanId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !username) {
      navigate('/auth');
      return;
    }
    loadLoans();
  }, [isAuthenticated, username, navigate]);

  const loadLoans = async () => {
    if (!username) return;

    setIsLoading(true);
    try {
      const data = await api.getMyLoans(username);
      setLoans(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos emprunts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (loanId: number) => {
    if (!username) return;

    setReturningLoanId(loanId);
    try {
      await api.returnBook(loanId, username);
      toast({
        title: 'Livre retourné',
        description: 'Le livre a été retourné avec succès',
      });
      loadLoans();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de retourner le livre',
        variant: 'destructive',
      });
    } finally {
      setReturningLoanId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <Badge variant="secondary">En attente</Badge>;
      case 'APPROVED':
        return <Badge variant="default">Approuvé</Badge>;
      case 'RETURNED':
        return <Badge variant="outline">Retourné</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Inconnu'}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <BookMarked className="h-8 w-8 text-accent" />
          <h1 className="text-4xl font-bold">Mes emprunts</h1>
        </div>

        {loans.length === 0 ? (
          <Card className="p-12 text-center gradient-card shadow-elegant">
            <BookMarked className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground mb-4">
              Vous n'avez aucun emprunt en cours
            </p>
            <Button onClick={() => navigate('/catalog')} variant="hero">
              Explorer le catalogue
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <Card key={loan.id} className="p-6 gradient-card shadow-elegant hover:shadow-hover transition-smooth">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-semibold text-lg">Emprunt #{loan.id}</h3>
                      {getStatusBadge(loan.status)}
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4" />
                        <span>Livre ID: {loan.bookId}</span>
                      </div>
                      {loan.loanDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Emprunté le: {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {loan.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            À retourner avant le: {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {loan.returnDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Retourné le: {new Date(loan.returnDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {loan.status?.toUpperCase() === 'APPROVED' && loan.id && !loan.returnDate && (
                    <Button
                      onClick={() => handleReturn(loan.id!)}
                      disabled={returningLoanId === loan.id}
                      size="sm"
                    >
                      {returningLoanId === loan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Retour...
                        </>
                      ) : (
                        'Retourner'
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLoans;
