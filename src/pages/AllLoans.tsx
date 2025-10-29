import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, Loan, Book } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Book as BookIcon, User as UserIcon, Calendar } from "lucide-react";

interface LoanWithBook extends Loan {
    book?: Book;
}

const AllLoans = () => {
    const { username } = useAuth();
    const { toast } = useToast();
    const [loans, setLoans] = useState<LoanWithBook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            setLoading(true);
            if (!username) return;

            // Get pending loans
            const data = await api.getPendingLoans();

            // Fetch book details for each loan
            const loansWithBooks = await Promise.all(
                data.map(async (loan) => {
                    try {
                        const book = await api.getBookById(loan.bookId);
                        return { ...loan, book };
                    } catch (error) {
                        console.error(`Failed to fetch book ${loan.bookId}:`, error);
                        return loan;
                    }
                })
            );

            setLoans(loansWithBooks);
        } catch (error: unknown) {
            toast({
                title: "Erreur",
                description: (error as Error).message || "Impossible de charger les emprunts",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (loanId: number) => {
        if (!username) return;

        try {
            await api.approveLoan(loanId, username);
            toast({
                title: "Succès",
                description: "Emprunt approuvé",
            });
            loadLoans();
        } catch (error: unknown) {
            toast({
                title: "Erreur",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        En attente
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approuvé
                    </Badge>
                );
            case "returned":
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Retourné
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        En attente
                    </Badge>
                );
        }
    };

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

    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Emprunts en attente d'approbation</span>
                        <Badge variant="outline">{loans.length} demande{loans.length > 1 ? 's' : ''}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loans.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-lg">Aucun emprunt en attente</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Les nouvelles demandes d'emprunt apparaîtront ici
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {loans.map((loan) => (
                                <Card key={loan.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-start gap-4">
                                                    <BookIcon className="w-5 h-5 text-primary mt-1" />
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-lg">
                                                            {loan.book?.title || `Livre #${loan.bookId}`}
                                                        </p>
                                                        {loan.book?.author && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Par {loan.book.author}
                                                            </p>
                                                        )}
                                                        {loan.book?.genre && (
                                                            <Badge variant="secondary" className="mt-1">
                                                                {loan.book.genre}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <UserIcon className="w-4 h-4" />
                                                    <span>Demandé par: <strong>{loan.username}</strong></span>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Demande: {formatDate(loan.loanDate)}</span>
                                                    </div>
                                                    {loan.dueDate && (
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>Retour prévu: {formatDate(loan.dueDate)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">Statut:</span>
                                                    {getStatusBadge(loan.status)}
                                                </div>
                                            </div>

                                            {(!loan.status || loan.status.toLowerCase() === "pending") && (
                                                <Button
                                                    onClick={() => loan.id && handleApprove(loan.id)}
                                                    className="bg-green-600 hover:bg-green-700 shrink-0"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Approuver
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AllLoans;