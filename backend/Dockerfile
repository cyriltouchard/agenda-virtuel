# Backend Dockerfile
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste des fichiers
COPY . .

# Exposer le port de l'API
EXPOSE 5000

# Commande de démarrage
CMD ["node", "server.js"]
