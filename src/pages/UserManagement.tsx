import { useState, useEffect } from "react";
import { api, User } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, User as UserIcon, Trash2, ArrowUp } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UserManagement = () => {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
        open: false,
        user: null,
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getAllUsers();
            setUsers(data);
        } catch (error: unknown) {
            toast({
                title: "Erreur",
                description: (error as Error).message || "Impossible de charger les utilisateurs",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async (username: string, newRole: string) => {
        try {
            await api.promoteUser(username, newRole);
            toast({
                title: "Succès",
                description: `Utilisateur ${username} promu au rôle ${newRole}`,
            });
            loadUsers();
        } catch (error: unknown) {
            toast({
                title: "Erreur",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.user) return;

        try {
            await api.deleteUser(deleteDialog.user.username);
            toast({
                title: "Succès",
                description: `Utilisateur ${deleteDialog.user.username} supprimé`,
            });
            setDeleteDialog({ open: false, user: null });
            loadUsers();
        } catch (error: unknown) {
            toast({
                title: "Erreur",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };

    const getRoleBadge = (role?: string) => {
        switch (role) {
            case "ROLE_ADMIN":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                    </Badge>
                );
            case "ROLE_LIBRARIAN":
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Bibliothécaire
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                        <UserIcon className="w-3 h-3 mr-1" />
                        Membre
                    </Badge>
                );
        }
    };

    if (loading) {
        return <div className="container mx-auto p-8">Chargement...</div>;
    }

    return (
        <div className="container mx-auto p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Gestion des utilisateurs</span>
                        <Badge variant="outline">{users.length} utilisateurs</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <Card key={user.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <p className="font-semibold text-lg">{user.username}</p>
                                                    {getRoleBadge(user.role)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.fullName || "Pas de nom complet"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                                            </div>

                                            <div className="flex gap-2 items-center">
                                                <div className="flex items-center gap-2">
                                                    <ArrowUp className="w-4 h-4 text-muted-foreground" />
                                                    <Select
                                                        value={user.role || "ROLE_MEMBER"}
                                                        onValueChange={(value) => handlePromote(user.username, value)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Changer le rôle" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ROLE_MEMBER">Membre</SelectItem>
                                                            <SelectItem value="ROLE_LIBRARIAN">Bibliothécaire</SelectItem>
                                                            <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setDeleteDialog({ open: true, user })}
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

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. L'utilisateur <strong>{deleteDialog.user?.username}</strong> sera
                            définitivement supprimé.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UserManagement;