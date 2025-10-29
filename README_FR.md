# BiblioModerne 📚

Une application web moderne de gestion de bibliothèque construite avec React, TypeScript et Tailwind CSS.

## ✨ Fonctionnalités

- 🔐 **Authentification** - Inscription et connexion sécurisées
- 📖 **Catalogue** - Parcourir et rechercher des livres par titre, auteur ou genre
- 🔍 **Recherche avancée** - Filtres intelligents pour trouver le livre parfait
- 📚 **Gestion des emprunts** - Demander, suivre et retourner des livres
- 👤 **Espace personnel** - Voir tous vos emprunts en cours et passés
- 🎨 **Design moderne** - Interface élégante et responsive

## 🚀 Configuration

### Prérequis

- Node.js (v18 ou supérieur)
- Un backend Spring Boot actif (voir section Backend)

### Installation

1. Cloner le dépôt
```bash
git clone <votre-repo>
cd bibliomoderne
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer l'API
```bash
cp .env.example .env
```

Modifier `.env` pour pointer vers votre API Spring Boot :
```
VITE_API_BASE_URL=http://localhost:8080/api
```

4. Démarrer l'application
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:8080`

## 🔌 Configuration du Backend

Cette application se connecte à une API Spring Boot avec les endpoints suivants :

### Authentification (`/api/auth`)
- `POST /register` - Inscription d'un nouveau membre
- `POST /login` - Connexion

### Livres (`/api/books`)
- `GET /search?title={}&author={}&genre={}` - Recherche de livres
- `GET /{id}` - Détails d'un livre
- `POST /` - Ajouter un livre (authentification requise)

### Emprunts (`/api/loans`)
- `POST /request` - Demander un emprunt
- `POST /approve` - Approuver un emprunt (bibliothécaire)
- `POST /return` - Retourner un livre
- `GET /my?username={}` - Mes emprunts

### Administration (`/api/admin`)
- `POST /create-librarian` - Créer un compte bibliothécaire (admin uniquement)

## 🎨 Architecture

```
src/
├── components/       # Composants réutilisables
│   ├── ui/          # Composants UI (shadcn)
│   ├── Navbar.tsx   # Navigation principale
│   └── BookCard.tsx # Carte de livre
├── contexts/        # Contextes React
│   └── AuthContext.tsx
├── lib/            # Utilitaires
│   ├── api.ts      # Service API
│   └── utils.ts    # Fonctions utilitaires
├── pages/          # Pages de l'application
│   ├── Home.tsx    # Page d'accueil
│   ├── Auth.tsx    # Connexion/Inscription
│   ├── Catalog.tsx # Catalogue de livres
│   ├── MyLoans.tsx # Mes emprunts
│   └── BookDetail.tsx # Détails d'un livre
└── index.css       # Design system
```

## 🎨 Design System

L'application utilise un design system cohérent avec :
- **Couleurs** : Bleu marine (sagesse) + Accents ambrés (chaleur)
- **Typographie** : Serif pour les titres, Sans-serif pour le contenu
- **Animations** : Transitions fluides avec cubic-bezier
- **Ombres** : Élégantes avec niveaux hover

Tous les styles sont définis dans `src/index.css` et `tailwind.config.ts`.

## 🔒 Sécurité

- Validation des entrées côté client
- Gestion sécurisée des tokens
- Protection des routes authentifiées
- Gestion d'erreurs robuste

## 📱 Responsive

L'application est entièrement responsive et fonctionne sur :
- 📱 Mobile (< 768px)
- 📱 Tablette (768px - 1024px)
- 💻 Desktop (> 1024px)

## 🛠️ Technologies

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles utilitaires
- **Shadcn/ui** - Composants UI
- **React Router** - Navigation
- **TanStack Query** - Gestion d'état serveur
- **Vite** - Build tool

## 📝 Scripts

```bash
npm run dev          # Démarrage en développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run lint         # Linter le code
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.
