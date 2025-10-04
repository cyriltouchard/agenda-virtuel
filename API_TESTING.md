# 🧪 Guide de Test de l'API Agenda Virtuel

Ce guide vous permet de tester l'API backend avec des outils comme curl, Postman ou Insomnia.

## 🔗 URL de Base
```
http://localhost:5000/api
```

## 📊 Test de Santé
```bash
curl -X GET http://localhost:5000/api/health
```

## 🔐 Tests d'Authentification

### 1. Inscription d'un nouvel utilisateur
```bash
curl -X POST http://localhost:5000/api/auth/inscription \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "motDePasse": "MonMotDePasse123"
  }'
```

**Réponse attendue :**
```json
{
  "message": "Compte créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "utilisateur": {
    "_id": "...",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "parametresVisibilite": {
      "profil": "amis",
      "agenda": "prive"
    }
  }
}
```

### 2. Connexion
```bash
curl -X POST http://localhost:5000/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "motDePasse": "MonMotDePasse123"
  }'
```

### 3. Obtenir le profil (nécessite un token)
```bash
curl -X GET http://localhost:5000/api/auth/profil \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

## 📅 Tests des Événements

### 1. Créer un événement
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -d '{
    "titre": "Réunion importante",
    "description": "Réunion avec l équipe de développement",
    "dateDebut": "2024-12-15T09:00:00.000Z",
    "dateFin": "2024-12-15T10:00:00.000Z",
    "lieu": "Salle de conférence A",
    "categorie": "travail",
    "visibilite": "prive"
  }'
```

### 2. Obtenir les événements
```bash
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### 3. Filtrer les événements par date
```bash
curl -X GET "http://localhost:5000/api/events?dateDebut=2024-12-01T00:00:00.000Z&dateFin=2024-12-31T23:59:59.999Z" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

## 👥 Tests des Utilisateurs

### 1. Rechercher des utilisateurs
```bash
curl -X GET "http://localhost:5000/api/users/rechercher?q=Jean" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### 2. Obtenir les notifications
```bash
curl -X GET http://localhost:5000/api/users/notifications \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

## 🔒 Codes de Statut HTTP

| Code | Signification | Description |
|------|--------------|-------------|
| 200  | OK           | Requête réussie |
| 201  | Created      | Ressource créée avec succès |
| 400  | Bad Request  | Données invalides |
| 401  | Unauthorized | Token manquant ou invalide |
| 403  | Forbidden    | Permissions insuffisantes |
| 404  | Not Found    | Ressource non trouvée |
| 500  | Server Error | Erreur interne du serveur |

## 🛠️ Outils Recommandés

### Postman
1. Importer la collection (créer un workspace)
2. Configurer les variables d'environnement :
   - `base_url`: `http://localhost:5000/api`
   - `token`: Token JWT obtenu après connexion

### Insomnia
1. Créer un nouveau workspace
2. Ajouter les requêtes une par une
3. Utiliser les variables d'environnement

### VS Code REST Client
Installer l'extension "REST Client" et créer un fichier `.http` :

```http
### Health Check
GET http://localhost:5000/api/health

### Inscription
POST http://localhost:5000/api/auth/inscription
Content-Type: application/json

{
  "nom": "Test",
  "prenom": "User",
  "email": "test@example.com",
  "motDePasse": "Password123"
}

### Connexion
POST http://localhost:5000/api/auth/connexion
Content-Type: application/json

{
  "email": "test@example.com",
  "motDePasse": "Password123"
}
```

## 🚨 Gestion des Erreurs

### Erreur de validation (400)
```json
{
  "error": "Données invalides",
  "details": [
    {
      "msg": "Email invalide",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Token expiré (401)
```json
{
  "error": "Token expiré. Veuillez vous reconnecter."
}
```

### Utilisateur non trouvé (404)
```json
{
  "error": "Utilisateur non trouvé"
}
```

## 📝 Conseils de Test

1. **Commencez par le health check** pour vérifier que le serveur fonctionne
2. **Inscrivez-vous d'abord** pour obtenir un token
3. **Sauvegardez le token** pour les requêtes suivantes
4. **Testez les erreurs** en envoyant des données invalides
5. **Vérifiez les permissions** en essayant d'accéder aux ressources d'autres utilisateurs

## 🔄 Séquence de Test Complète

1. Health check
2. Inscription utilisateur 1
3. Connexion utilisateur 1 → sauvegarder token1
4. Créer quelques événements avec token1
5. Inscription utilisateur 2
6. Connexion utilisateur 2 → sauvegarder token2
7. Tester la recherche d'utilisateurs
8. Tester les demandes d'amis
9. Tester les permissions (utilisateur 2 ne peut pas voir les événements privés de l'utilisateur 1)

---

**Note**: Remplacez `VOTRE_TOKEN_ICI` par le token JWT réel obtenu lors de la connexion.