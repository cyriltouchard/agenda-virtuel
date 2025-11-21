# Stage 1: Build de l'application Angular
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY src ./src

# Build de l'application en mode production
RUN npm run build -- --configuration production

# Stage 2: Servir avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés depuis le stage précédent
COPY --from=build /app/dist/agenda-virtuel-frontend /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Nginx démarre automatiquement
CMD ["nginx", "-g", "daemon off;"]
