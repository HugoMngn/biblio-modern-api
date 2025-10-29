import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { username, fullName: currentFullName, role, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username) {
      navigate('/auth');
    }
  }, [username, navigate]);

  useEffect(() => {
    if (currentFullName) {
      setFullName(currentFullName);
    }
  }, [currentFullName]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) return;

    if (!fullName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom complet ne peut pas être vide',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.updateProfile({
        username,
        fullName: fullName.trim(),
      });

      // Update local storage
      localStorage.setItem('fullName', fullName.trim());

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été modifiées avec succès',
      });

      // Reload to update context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour le profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({
        username,
        oldPassword,
        newPassword,
      });

      toast({
        title: 'Mot de passe modifié',
        description: 'Vous allez être déconnecté. Veuillez vous reconnecter avec votre nouveau mot de passe.',
      });

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Logout after 2 seconds
      setTimeout(() => {
        logout();
        navigate('/auth');
      }, 2000);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de changer le mot de passe',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (roleValue: string | null) => {
    switch (roleValue) {
      case 'ROLE_ADMIN':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <Shield className="w-3 h-3 mr-1" />
          Administrateur
        </span>;
      case 'ROLE_LIBRARIAN':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <Shield className="w-3 h-3 mr-1" />
          Bibliothécaire
        </span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <User className="w-3 h-3 mr-1" />
          Membre
        </span>;
    }
  };

  if (!username) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Mon Profil</h1>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">
              <User className="w-4 h-4 mr-2" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="w-4 h-4 mr-2" />
              Mot de passe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Consultez et modifiez vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label>Nom d'utilisateur</Label>
                    <Input
                      value={username}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Le nom d'utilisateur ne peut pas être modifié
                    </p>
                  </div>

                  <div>
                    <Label>Rôle</Label>
                    <div className="mt-2">
                      {getRoleBadge(role)}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !fullName.trim()}
                    className="w-full"
                  >
                    {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>
                  Assurez-vous d'utiliser un mot de passe sécurisé d'au moins 6 caractères
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="oldPassword">Mot de passe actuel</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-sm text-destructive mt-1">
                        Les mots de passe ne correspondent pas
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !oldPassword || !newPassword || newPassword !== confirmPassword}
                    className="w-full"
                    variant="destructive"
                  >
                    {loading ? 'Modification...' : 'Changer le mot de passe'}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Vous serez déconnecté après le changement de mot de passe
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;