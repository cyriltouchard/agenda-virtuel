const express = require('express');
const router = express.Router();
// const auth = require('../middleware/auth'); // Désactivé temporairement

// Modèle temporaire pour les amis (en attendant la vraie base de données)
let friends = [];
let friendRequests = [];
let users = [
  { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@email.com', avatar: null },
  { id: 2, nom: 'Martin', prenom: 'Marie', email: 'marie.martin@email.com', avatar: null },
  { id: 3, nom: 'Durand', prenom: 'Pierre', email: 'pierre.durand@email.com', avatar: null }
];

// GET /api/friends - Récupérer la liste des amis
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const userId = 1; // ID utilisateur fixe pour la démo

    // Simuler des amis pour la démo
    const userFriends = friends.filter(f => 
      f.utilisateur1Id === userId || f.utilisateur2Id === userId
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFriends = userFriends.slice(startIndex, endIndex);

    res.json({
      friends: paginatedFriends,
      total: userFriends.length,
      page,
      pages: Math.ceil(userFriends.length / limit)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des amis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/friends/requests - Récupérer les demandes d'amis
router.get('/requests', (req, res) => {
  try {
    const userId = 1; // ID utilisateur fixe pour la démo
    
    const receivedRequests = friendRequests.filter(r => 
      r.destinataireId === userId && r.statut === 'en_attente'
    );
    
    const sentRequests = friendRequests.filter(r => 
      r.expediteurId === userId && r.statut === 'en_attente'
    );

    res.json({
      received: receivedRequests,
      sent: sentRequests
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/friends/request - Envoyer une demande d'ami
router.post('/request', (req, res) => {
  try {
    const { destinataireId } = req.body;
    const expediteurId = 1; // ID utilisateur fixe pour la démo

    // Vérifier si la demande existe déjà
    const existingRequest = friendRequests.find(r => 
      (r.expediteurId === expediteurId && r.destinataireId === destinataireId) ||
      (r.expediteurId === destinataireId && r.destinataireId === expediteurId)
    );

    if (existingRequest) {
      return res.status(400).json({ error: 'Demande déjà envoyée' });
    }

    const newRequest = {
      id: friendRequests.length + 1,
      expediteurId,
      destinataireId,
      statut: 'en_attente',
      dateCreation: new Date()
    };

    friendRequests.push(newRequest);

    res.status(201).json({
      message: 'Demande d\'ami envoyée',
      request: newRequest
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la demande:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/friends/request/:id/accept - Accepter une demande d'ami
router.put('/request/:id/accept', (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = 1; // ID utilisateur fixe pour la démo

    const request = friendRequests.find(r => 
      r.id === requestId && r.destinataireId === userId
    );

    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    // Mettre à jour le statut
    request.statut = 'accepte';
    request.dateReponse = new Date();

    // Créer l'amitié
    const friendship = {
      id: friends.length + 1,
      utilisateur1Id: request.expediteurId,
      utilisateur2Id: request.destinataireId,
      dateCreation: new Date(),
      statut: 'actif'
    };

    friends.push(friendship);

    res.json({
      message: 'Demande acceptée',
      friendship
    });
  } catch (error) {
    console.error('Erreur lors de l\'acceptation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/friends/request/:id/decline - Refuser une demande d'ami
router.put('/request/:id/decline', (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = 1; // ID utilisateur fixe pour la démo

    const request = friendRequests.find(r => 
      r.id === requestId && r.destinataireId === userId
    );

    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    request.statut = 'refuse';
    request.dateReponse = new Date();

    res.json({
      message: 'Demande refusée'
    });
  } catch (error) {
    console.error('Erreur lors du refus:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/friends/search - Rechercher des utilisateurs
router.get('/search', (req, res) => {
  try {
    const { query } = req.query;
    const userId = 1; // ID utilisateur fixe pour la démo

    if (!query || query.length < 2) {
      return res.json({ users: [] });
    }

    // Rechercher dans les utilisateurs
    const searchResults = users.filter(user => 
      user.id !== userId &&
      (user.nom.toLowerCase().includes(query.toLowerCase()) ||
       user.prenom.toLowerCase().includes(query.toLowerCase()) ||
       user.email.toLowerCase().includes(query.toLowerCase()))
    );

    res.json({
      users: searchResults.slice(0, 10) // Limiter à 10 résultats
    });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/friends/:id - Supprimer un ami
router.delete('/:id', (req, res) => {
  try {
    const friendshipId = parseInt(req.params.id);
    const userId = 1; // ID utilisateur fixe pour la démo

    const friendshipIndex = friends.findIndex(f => 
      f.id === friendshipId && 
      (f.utilisateur1Id === userId || f.utilisateur2Id === userId)
    );

    if (friendshipIndex === -1) {
      return res.status(404).json({ error: 'Amitié non trouvée' });
    }

    friends.splice(friendshipIndex, 1);

    res.json({
      message: 'Ami supprimé'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;