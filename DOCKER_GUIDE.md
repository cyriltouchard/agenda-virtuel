# 🐳 Guide Complet Docker - Agenda Virtuel

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Structure du projet Docker](#structure-du-projet-docker)
3. [Configuration](#configuration)
4. [Démarrage rapide](#démarrage-rapide)
5. [Commandes Docker utiles](#commandes-docker-utiles)
6. [Développement](#développement)
7. [Production](#production)
8. [Dépannage](#dépannage)
9. [Backup et restauration](#backup-et-restauration)

---

## 🔧 Prérequis

### Installation de Docker

#### Windows
1. Téléchargez [Docker Desktop pour Windows](https://www.docker.com/products/docker-desktop)
2. Installez Docker Desktop
3. Redémarrez votre ordinateur
4. Vérifiez l'installation :
```powershell
docker --version
docker-compose --version
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
```

#### macOS
1. Téléchargez [Docker Desktop pour Mac](https://www.docker.com/products/docker-desktop)
2. Installez et lancez Docker Desktop
3. Vérifiez l'installation dans le terminal

---

## 🏗️ Structure du projet Docker

```
agenda-virtuel/
├── docker-compose.yml          # Orchestration des conteneurs
├── .env.example                # Variables d'environnement exemple
├── .dockerignore               # Fichiers à exclure
├── backend/
│   ├── Dockerfile              # Image Docker du backend
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Image Docker du frontend
│   ├── nginx.conf              # Configuration Nginx
│   └── .dockerignore
└── DOCKER_GUIDE.md            # Ce guide
```

### Services Docker

- **mongodb** : Base de données MongoDB 7.0
- **backend** : API Node.js/Express (port 5000)
- **frontend** : Application Angular avec Nginx (port 4200)

---

## ⚙️ Configuration

### 1. Créer le fichier .env

Copiez le fichier d'exemple et personnalisez-le :

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# Linux/macOS
cp .env.example .env
```

### 2. Modifier les variables d'environnement

Éditez le fichier `.env` :

```env
# Configuration MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=VotreMotDePasseSecurise123!

# Configuration Backend
JWT_SECRET=votre-cle-secrete-tres-longue-et-complexe-changez-moi
NODE_ENV=production

# URLs
CLIENT_URL=http://localhost:4200
```

⚠️ **IMPORTANT** : Changez `JWT_SECRET` et `MONGO_ROOT_PASSWORD` en production !

---

## 🚀 Démarrage rapide

### Première utilisation

1. **Cloner et configurer** :
```powershell
cd c:\Users\cyril\agenda-virtuel
Copy-Item .env.example .env
# Éditez .env avec vos valeurs
```

2. **Construire et démarrer tous les services** :
```powershell
docker-compose up --build
```

3. **Accéder à l'application** :
- Frontend : http://localhost:4200
- Backend API : http://localhost:5000
- MongoDB : localhost:27017

### Démarrage normal

```powershell
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down
```

---

## 🛠️ Commandes Docker utiles

### Gestion des conteneurs

```powershell
# Démarrer les services en arrière-plan
docker-compose up -d

# Arrêter les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs d'un service
docker-compose logs -f backend

# Voir l'état des conteneurs
docker-compose ps

# Exécuter une commande dans un conteneur
docker-compose exec backend sh
docker-compose exec mongodb mongosh
```

### Construction et rebuild

```powershell
# Reconstruire les images
docker-compose build

# Reconstruire et démarrer
docker-compose up --build

# Reconstruire un service spécifique
docker-compose build backend

# Reconstruire sans cache
docker-compose build --no-cache
```

### Nettoyage

```powershell
# Arrêter et supprimer les conteneurs, réseaux
docker-compose down

# Supprimer aussi les volumes (⚠️ efface la DB)
docker-compose down -v

# Nettoyer les images inutilisées
docker system prune

# Nettoyer complètement (images, volumes, réseaux)
docker system prune -a --volumes
```

---

## 💻 Développement

### Mode développement avec hot-reload

Pour le développement, vous pouvez créer un `docker-compose.dev.yml` :

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      target: build
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm start
    ports:
      - "4200:4200"
```

Utilisation :
```powershell
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Accéder à la base de données

```powershell
# Connexion MongoDB
docker-compose exec mongodb mongosh -u admin -p

# Depuis l'extérieur avec MongoDB Compass
mongodb://admin:changeme@localhost:27017/agenda-virtuel?authSource=admin
```

### Installer des dépendances

```powershell
# Backend
docker-compose exec backend npm install nom-du-package

# Reconstruire après ajout de dépendances
docker-compose build backend
```

---

## 🌐 Production

### Déploiement sur un serveur

1. **Configuration pour la production** :

Créez un fichier `.env.production` :

```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=MotDePasseTresSecurise!@#
JWT_SECRET=cle-secrete-production-longue-et-complexe
NODE_ENV=production
CLIENT_URL=https://votre-domaine.com
```

2. **Utiliser Docker Compose en production** :

```bash
# Démarrer avec le fichier d'environnement de production
docker-compose --env-file .env.production up -d

# Activer la rotation des logs
docker-compose --env-file .env.production up -d --log-opt max-size=10m --log-opt max-file=3
```

3. **Configuration Nginx reverse proxy (optionnel)** :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:4200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

### Monitoring

```powershell
# Vérifier l'utilisation des ressources
docker stats

# Vérifier la santé des conteneurs
docker-compose ps
```

---

## 🔍 Dépannage

### Problème : Le conteneur backend ne démarre pas

```powershell
# Voir les logs détaillés
docker-compose logs backend

# Vérifier la connexion MongoDB
docker-compose exec backend ping mongodb
```

### Problème : MongoDB refuse la connexion

```powershell
# Vérifier que MongoDB est prêt
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redémarrer MongoDB
docker-compose restart mongodb
```

### Problème : Port déjà utilisé

```powershell
# Windows - Trouver le processus utilisant le port 5000
netstat -ano | findstr :5000

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F

# Ou changer le port dans docker-compose.yml
ports:
  - "5001:5000"  # Utiliser le port 5001 au lieu de 5000
```

### Problème : Images corrompues

```powershell
# Reconstruire complètement
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Problème : Manque d'espace disque

```powershell
# Voir l'utilisation de l'espace
docker system df

# Nettoyer
docker system prune -a --volumes
```

### Logs et debugging

```powershell
# Tous les logs
docker-compose logs

# Logs d'un service spécifique
docker-compose logs -f backend

# Les 100 dernières lignes
docker-compose logs --tail=100 backend

# Entrer dans un conteneur
docker-compose exec backend sh
```

---

## 💾 Backup et restauration

### Backup de la base de données

```powershell
# Créer un backup
docker-compose exec mongodb mongodump --username admin --password changeme --authenticationDatabase admin --db agenda-virtuel --out /data/backup

# Copier le backup sur l'hôte
docker cp agenda-mongodb:/data/backup ./backups/$(Get-Date -Format "yyyy-MM-dd")
```

### Restauration de la base de données

```powershell
# Copier le backup dans le conteneur
docker cp ./backups/2025-11-21 agenda-mongodb:/data/restore

# Restaurer
docker-compose exec mongodb mongorestore --username admin --password changeme --authenticationDatabase admin --db agenda-virtuel /data/restore/agenda-virtuel
```

### Backup automatique (script PowerShell)

Créez `backup-mongodb.ps1` :

```powershell
$date = Get-Date -Format "yyyy-MM-dd-HHmmss"
$backupDir = ".\backups\$date"

# Créer le répertoire de backup
New-Item -ItemType Directory -Force -Path $backupDir

# Effectuer le backup
docker-compose exec -T mongodb mongodump `
    --username admin `
    --password changeme `
    --authenticationDatabase admin `
    --db agenda-virtuel `
    --archive | Set-Content -Path "$backupDir\backup.archive" -Encoding Byte

Write-Host "Backup créé : $backupDir"
```

---

## 📊 Commandes de surveillance

### Monitoring en temps réel

```powershell
# Statistiques des conteneurs
docker stats

# État de santé
docker-compose ps

# Utilisation de l'espace
docker system df

# Inspecter un conteneur
docker inspect agenda-backend
```

### Vérification de santé

```powershell
# Vérifier l'API backend
curl http://localhost:5000/api/health

# Vérifier le frontend
curl http://localhost:4200

# Vérifier MongoDB
docker-compose exec mongodb mongosh --eval "db.runCommand({ ping: 1 })"
```

---

## 🔐 Sécurité

### Bonnes pratiques

1. **Ne jamais committer le fichier `.env`**
2. **Utiliser des mots de passe forts** pour MongoDB et JWT
3. **Mettre à jour régulièrement** les images Docker :
   ```powershell
   docker-compose pull
   docker-compose up -d
   ```
4. **Limiter l'exposition des ports** en production
5. **Utiliser HTTPS** avec un reverse proxy (Nginx, Traefik)

### Changer les secrets en production

```powershell
# Générer un JWT secret fort
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

---

## 📖 Ressources supplémentaires

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Docker Hub - Images MongoDB](https://hub.docker.com/_/mongo)
- [Docker Hub - Images Node](https://hub.docker.com/_/node)
- [Docker Hub - Images Nginx](https://hub.docker.com/_/nginx)

---

## ✅ Checklist de déploiement

- [ ] Docker et Docker Compose installés
- [ ] Fichier `.env` créé et configuré
- [ ] Secrets de production générés
- [ ] Images construites : `docker-compose build`
- [ ] Services démarrés : `docker-compose up -d`
- [ ] Santé vérifiée : `docker-compose ps`
- [ ] API testée : `curl http://localhost:5000/api/health`
- [ ] Frontend accessible : http://localhost:4200
- [ ] Backup configuré
- [ ] Monitoring en place

---

## 🆘 Support

En cas de problème :

1. Consultez les logs : `docker-compose logs`
2. Vérifiez la section [Dépannage](#dépannage)
3. Vérifiez que Docker Desktop est démarré
4. Redémarrez les services : `docker-compose restart`

---

**Bon déploiement ! 🚀**
