# 📅 Agenda Virtuel

Une application web moderne de gestion d'agenda avec partage de contenu et fonctionnalités collaboratives.

## 🚀 Fonctionnalités Principales

### ✅ Phase 1 - Implémentée
- **Backend complet** avec Node.js, Express et MongoDB
- **Système d'authentification** JWT sécurisé
- **API RESTful** pour la gestion des utilisateurs et événements
- **Base du frontend Angular** avec Material Design
- **Architecture modulaire** et scalable

### 🔄 Prochaines phases
- Interface utilisateur complète
- Calendrier interactif
- Partage d'événements et collaboration
- Système de notifications en temps réel
- Upload de fichiers et gestion multimedia

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** + **Express.js** - Serveur web
- **MongoDB** + **Mongoose** - Base de données NoSQL
- **JWT** - Authentification sécurisée
- **bcryptjs** - Hashage des mots de passe
- **express-validator** - Validation des données
- **helmet** + **cors** - Sécurité

### Frontend
- **Angular 17** - Framework frontend moderne
- **Angular Material** - Interface utilisateur
- **RxJS** - Programmation réactive
- **TypeScript** - Typage statique
- **SCSS** - Styles avancés

## 📋 Prérequis

- **Node.js** (version 18 ou supérieure)
- **MongoDB** (local ou MongoDB Atlas)
- **npm** ou **yarn**
- **Angular CLI** (optionnel mais recommandé)

## 🚀 Installation et Démarrage

### 1. Cloner le projet
```bash
git clone [URL_DU_REPO]
cd agendaVirtuel
```

### 2. Backend Setup

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec vos configurations

# Démarrer MongoDB (si local)
mongod

# Démarrer le serveur de développement
npm run dev
```

Le backend sera accessible sur `http://localhost:5000`

### 3. Frontend Setup

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

Le frontend sera accessible sur `http://localhost:4200`

## ⚙️ Configuration

### Variables d'environnement Backend (.env)

```env
# Port du serveur
PORT=5000

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/agenda-virtuel

# JWT Configuration
JWT_SECRET=votre_jwt_secret_super_securise
JWT_EXPIRE=1d

# URL du frontend pour CORS
CLIENT_URL=http://localhost:4200
```

### Configuration MongoDB

#### Option 1: MongoDB Local
1. Installer MongoDB Community Edition
2. Démarrer le service MongoDB
3. Utiliser l'URI: `mongodb://localhost:27017/agenda-virtuel`

#### Option 2: MongoDB Atlas (Cloud)
1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un cluster
3. Obtenir l'URI de connexion
4. Mettre à jour `MONGODB_URI` dans le fichier `.env`

## 📡 API Endpoints

### Authentification
- `POST /api/auth/inscription` - Créer un compte
- `POST /api/auth/connexion` - Se connecter
- `GET /api/auth/profil` - Obtenir le profil (protégé)
- `PUT /api/auth/profil` - Mettre à jour le profil (protégé)
- `POST /api/auth/changer-mot-de-passe` - Changer le mot de passe (protégé)

### Utilisateurs
- `GET /api/users/rechercher` - Rechercher des utilisateurs (protégé)
- `GET /api/users/:id` - Obtenir un profil utilisateur (protégé)
- `POST /api/users/:id/demande-ami` - Envoyer une demande d'ami (protégé)
- `GET /api/users/notifications` - Obtenir les notifications (protégé)

### Événements
- `GET /api/events` - Obtenir les événements (protégé)
- `POST /api/events` - Créer un événement (protégé)
- `GET /api/events/:id` - Obtenir un événement (protégé)
- `PUT /api/events/:id` - Mettre à jour un événement (protégé)
- `DELETE /api/events/:id` - Supprimer un événement (protégé)
- `POST /api/events/:id/commentaires` - Ajouter un commentaire (protégé)

## 🏗️ Architecture du Projet

```
agendaVirtuel/
├── backend/
│   ├── controllers/     # Logique métier
│   ├── models/         # Modèles de données Mongoose
│   ├── routes/         # Routes API Express
│   ├── middleware/     # Middlewares (auth, validation)
│   ├── utils/          # Utilitaires
│   └── server.js       # Point d'entrée
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Composants Angular
│   │   │   ├── services/      # Services Angular
│   │   │   ├── models/        # Interfaces TypeScript
│   │   │   ├── guards/        # Guards de route
│   │   │   └── interceptors/  # Intercepteurs HTTP
│   │   └── styles.scss        # Styles globaux
│   └── angular.json
```

## 🔒 Sécurité

- **JWT** pour l'authentification stateless
- **bcryptjs** pour le hashage des mots de passe
- **Helmet** pour les en-têtes de sécurité
- **CORS** configuré pour le frontend
- **Rate limiting** pour prévenir les attaques
- **Validation** stricte des données d'entrée

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 Scripts Disponibles

### Backend
- `npm start` - Démarrer en production
- `npm run dev` - Démarrer avec nodemon (développement)
- `npm test` - Lancer les tests

### Frontend
- `npm start` - Serveur de développement
- `npm run build` - Build de production
- `npm test` - Tests unitaires
- `npm run lint` - Vérification du code

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🐛 Signalement de Bugs

Pour signaler un bug, veuillez ouvrir une issue avec :
- Description détaillée du problème
- Étapes pour reproduire
- Comportement attendu
- Captures d'écran si applicable

## 📞 Support

Pour toute question ou support, contactez l'équipe de développement.

---

**Statut du projet**: ✅ Phase 1 terminée - Backend et base frontend fonctionnels
**Prochaine étape**: Développement complet de l'interface utilisateur et du calendrier interactif