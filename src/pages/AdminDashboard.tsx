import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Shield } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleCreateLibrarian = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createLibrarian(username, password, fullName);
      toast({
        title: 'Bibliothécaire créé',
        description: `Le compte ${username} a été créé avec succès`,
      });
      setUsername('');
      setPassword('');
      setFullName('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer le compte',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Administration</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Créer un compte bibliothécaire
              </CardTitle>
              <CardDescription>
                Les bibliothécaires peuvent gérer les emprunts et le catalogue de livres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLibrarian} className="space-y-4">
                <div>
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="librarian01"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Marie Dupont"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Création...' : 'Créer le bibliothécaire'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Fonctionnalité à venir : promouvoir des membres en bibliothécaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                TODO: Ajouter un endpoint backend pour lister les utilisateurs et les promouvoir
                <br />
                Endpoint suggéré : GET /api/admin/users et POST /api/admin/promote
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
