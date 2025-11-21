# 🐳 Démarrage Rapide Docker

## ✅ Votre application est maintenant sur Docker !

### 📍 Accès rapide

- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:5000
- **MongoDB** : mongodb://localhost:27017

### 🚀 Commandes rapides

```powershell
# Démarrer l'application
.\docker-start.ps1

# Arrêter l'application
.\docker-stop.ps1

# Voir les logs en temps réel
.\docker-logs.ps1

# Reconstruire complètement
.\docker-rebuild.ps1
```

### 📦 Conteneurs en cours d'exécution

- **agenda-mongodb** : Base de données MongoDB 7.0
- **agenda-backend** : API Node.js/Express (port 5000)
- **agenda-frontend** : Application Angular avec Nginx (port 4200)

### 🔧 Commandes Docker manuelles

```powershell
# Voir l'état des conteneurs
docker-compose ps

# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Reconstruire
docker-compose up --build

# Entrer dans un conteneur
docker-compose exec backend sh
docker-compose exec mongodb mongosh
```

### 🗂️ Structure Docker

```
agenda-virtuel/
├── docker-compose.yml       # Configuration orchestration
├── .env                     # Variables d'environnement
├── backend/
│   ├── Dockerfile          # Image backend
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile          # Image frontend
│   ├── nginx.conf          # Config Nginx
│   └── .dockerignore
└── DOCKER_GUIDE.md         # Guide complet
```

### ⚙️ Configuration

Les variables d'environnement sont dans le fichier `.env` :

```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme
JWT_SECRET=your-secret-key
NODE_ENV=production
CLIENT_URL=http://localhost:4200
```

### 📚 Documentation complète

Pour plus de détails, consultez **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)**

---

**Tout est prêt ! Votre application tourne sur Docker 🎉**
