# BiblioModerne - Application de Gestion de Bibliothèque

## 🎯 Présentation

BiblioModerne est une application web moderne de gestion de bibliothèque construite avec React, TypeScript et Vite. Elle offre une interface utilisateur élégante et réactive pour gérer les livres, les emprunts et les utilisateurs d'une bibliothèque.

## 🏗️ Architecture

### Structure du Projet

```
src/
├── components/     # Composants réutilisables
├── contexts/      # Contextes React (Auth)
├── hooks/         # Hooks personnalisés
├── lib/          # Services et utilitaires
└── pages/        # Pages/Routes de l'application
```

### Technologies Principales

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **UI Components**: Shadcn UI
- **State Management**: React Context
- **Routing**: React Router
- **API Client**: Custom API service
- **Styling**: Tailwind CSS

## 🔑 Fonctionnalités Clés

### Système d'Authentification

Le système d'authentification est géré par le `AuthContext` qui fournit :
- Gestion des sessions utilisateur
- Hiérarchie des rôles (Admin > Librarian > Member)
- Persistance des données de session
- Gestion des tokens et sécurité

### Gestion des Rôles

3 niveaux d'accès sont implémentés :

1. **Administrateur** (`ROLE_ADMIN`)
   - Création de comptes bibliothécaires
   - Gestion complète des utilisateurs
   - Accès à toutes les fonctionnalités

2. **Bibliothécaire** (`ROLE_LIBRARIAN`)
   - Gestion du catalogue de livres
   - Approbation des emprunts
   - Suivi des retours

3. **Membre** (`ROLE_MEMBER`)
   - Consultation du catalogue
   - Demande d'emprunts
   - Gestion de son profil

### API Service (`api.ts`)

Le service API est une classe qui centralise toutes les interactions avec le backend :

```typescript
class LibraryAPI {
  // Auth
  register(data: RegisterRequest): Promise<User>
  login(data: LoginRequest): Promise<LoginResponse>
  changePassword(data: ChangePasswordRequest): Promise<string>
  
  // Books
  searchBooks(params: SearchParams): Promise<Book[]>
  getBookById(id: number): Promise<Book>
  addBook(book: Book): Promise<Book>
  
  // Loans
  requestLoan(username: string, bookId: number): Promise<Loan>
  approveLoan(loanId: number, approver: string): Promise<Loan>
  returnBook(loanId: number, username: string): Promise<Loan>
}
```

### Gestion des Emprunts

Le système de prêt comprend plusieurs états :
- **En attente** : Demande initiale
- **Approuvé** : Validé par un bibliothécaire
- **En cours** : Livre emprunté
- **Retourné** : Emprunt terminé
- **En retard** : Dépassement de la date de retour

## 📱 Interfaces Principales

### Composants UI

1. **BookCard**
   - Affichage des informations d'un livre
   - Actions contextuelles selon le rôle
   - État de disponibilité

2. **Navbar**
   - Navigation adaptative
   - Menu dynamique selon le rôle
   - État de connexion

### Pages

1. **Catalog** (`/catalog`)
   - Liste des livres disponibles
   - Filtres de recherche
   - Actions d'emprunt

2. **MyLoans** (`/my-loans`)
   - Suivi des emprunts personnels
   - États et dates
   - Actions de retour

3. **AdminDashboard** (`/admin`)
   - Gestion des utilisateurs
   - Création de bibliothécaires
   - Statistiques

4. **LibrarianDashboard** (`/librarian`)
   - Gestion du catalogue
   - Validation des emprunts
   - Suivi des retours

## 💫 Fonctionnalités Avancées

### Gestion des États

- Utilisation de React Query pour la gestion du cache
- Contextes pour l'état global
- États locaux pour les formulaires

### Validation et Sécurité

- Validation des formulaires
- Gestion des erreurs API
- Protection des routes
- Vérification des rôles

### UI/UX

- Design responsive
- Thème sombre/clair
- Feedback utilisateur (toasts)
- Loading states
- Gestion des erreurs

## 🛠️ Configuration

Le projet utilise plusieurs fichiers de configuration :

- `vite.config.ts` : Configuration de Vite
- `tsconfig.json` : Configuration TypeScript
- `tailwind.config.ts` : Configuration Tailwind CSS
- `.env` : Variables d'environnement

## 🔧 Installation

1. Cloner le repository
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Configurer les variables d'environnement :
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
4. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

## 🌟 Bonnes Pratiques Implémentées

1. **Architecture Modulaire**
   - Séparation claire des responsabilités
   - Composants réutilisables
   - Services isolés

2. **Gestion des Types**
   - TypeScript strict
   - Interfaces pour les modèles
   - Types pour les props

3. **Sécurité**
   - Validation des entrées
   - Protection des routes
   - Gestion des tokens

4. **Performance**
   - Lazy loading des routes
   - Optimisation des requêtes
   - Mise en cache appropriée

5. **Maintenabilité**
   - Code commenté
   - Structure claire
   - Nommage explicite

## 📚 Documentation des Modèles

### User
```typescript
interface User {
  id?: number;
  username: string;
  fullName: string;
  role?: string;
}
```

### Book
```typescript
interface Book {
  id?: number;
  title: string;
  author: string;
  genre: string;
  isbn?: string;
  available?: boolean;
}
```

### Loan
```typescript
interface Loan {
  id?: number;
  bookId: number;
  username: string;
  loanDate?: string;
  dueDate?: string;
  returnDate?: string;
  status?: string;
  approved?: boolean;
}
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici quelques domaines d'amélioration possibles :

1. Tests unitaires et d'intégration
2. Internationalisation
3. Mode hors ligne
4. PWA
5. Nouvelles fonctionnalités
