const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authentification } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/rechercher
// @desc    Rechercher des utilisateurs
// @access  Privé
router.get('/rechercher', authentification, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Le terme de recherche doit contenir au moins 2 caractères'
      });
    }

    const skip = (page - 1) * limit;
    
    // Créer une expression régulière pour la recherche insensible à la casse
    const regex = new RegExp(q.trim(), 'i');
    
    const utilisateurs = await User.find({
      $and: [
        {
          $or: [
            { nom: regex },
            { prenom: regex },
            { email: regex }
          ]
        },
        { _id: { $ne: req.user._id } }, // Exclure l'utilisateur actuel
        { actif: true }
      ]
    })
    .select('nom prenom email photo parametresVisibilite')
    .limit(parseInt(limit))
    .skip(skip)
    .sort({ nom: 1, prenom: 1 });

    // Filtrer selon les paramètres de visibilité
    const utilisateursFiltres = utilisateurs.filter(utilisateur => {
      return utilisateur.parametresVisibilite.profil === 'public' ||
             (utilisateur.parametresVisibilite.profil === 'amis' && 
              req.user.amis.includes(utilisateur._id));
    });

    res.json({
      utilisateurs: utilisateursFiltres,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: utilisateursFiltres.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Obtenir le profil d'un utilisateur
// @access  Privé
router.get('/:id', authentification, async (req, res) => {
  try {
    const utilisateur = await User.findById(req.params.id)
      .select('nom prenom email photo bio parametresVisibilite amis dernierConnexion')
      .populate('amis', 'nom prenom photo');

    if (!utilisateur) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'utilisateur peut voir ce profil
    const peutVoir = utilisateur._id.toString() === req.user._id.toString() ||
                     utilisateur.parametresVisibilite.profil === 'public' ||
                     (utilisateur.parametresVisibilite.profil === 'amis' && 
                      req.user.amis.includes(utilisateur._id));

    if (!peutVoir) {
      return res.status(403).json({
        error: 'Accès refusé à ce profil'
      });
    }

    // Si ce n'est pas l'utilisateur lui-même, masquer certaines informations
    if (utilisateur._id.toString() !== req.user._id.toString()) {
      utilisateur.email = undefined;
      if (utilisateur.parametresVisibilite.profil !== 'public') {
        utilisateur.amis = undefined;
      }
    }

    res.json({
      utilisateur
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du profil'
    });
  }
});

// @route   POST /api/users/:id/demande-ami
// @desc    Envoyer une demande d'ami
// @access  Privé
router.post('/:id/demande-ami', authentification, async (req, res) => {
  try {
    const destinataireId = req.params.id;
    const expediteurId = req.user._id;

    if (destinataireId === expediteurId.toString()) {
      return res.status(400).json({
        error: 'Vous ne pouvez pas vous envoyer une demande d\'ami à vous-même'
      });
    }

    const destinataire = await User.findById(destinataireId);
    if (!destinataire) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si ils sont déjà amis
    if (req.user.amis.includes(destinataireId)) {
      return res.status(400).json({
        error: 'Vous êtes déjà amis avec cet utilisateur'
      });
    }

    // Vérifier si une demande existe déjà
    const demandeExistante = destinataire.demandesAmis.find(
      demande => demande.de.toString() === expediteurId.toString()
    );

    if (demandeExistante) {
      return res.status(400).json({
        error: 'Demande d\'ami déjà envoyée'
      });
    }

    // Ajouter la demande d'ami
    destinataire.demandesAmis.push({
      de: expediteurId,
      dateDemande: new Date()
    });

    // Ajouter une notification
    destinataire.notifications.push({
      type: 'ami_demande',
      message: `${req.user.prenom} ${req.user.nom} vous a envoyé une demande d'ami`,
      de: expediteurId
    });

    await destinataire.save();

    res.json({
      message: 'Demande d\'ami envoyée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la demande d\'ami:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de la demande'
    });
  }
});

// @route   POST /api/users/demandes-amis/:demandeId/repondre
// @desc    Répondre à une demande d'ami
// @access  Privé
router.post('/demandes-amis/:demandeId/repondre', [
  authentification,
  body('accepter').isBoolean().withMessage('Réponse invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { accepter } = req.body;
    const utilisateur = await User.findById(req.user._id);

    // Trouver la demande d'ami
    const demande = utilisateur.demandesAmis.id(req.params.demandeId);
    if (!demande) {
      return res.status(404).json({
        error: 'Demande d\'ami non trouvée'
      });
    }

    const expediteur = await User.findById(demande.de);
    if (!expediteur) {
      return res.status(404).json({
        error: 'Utilisateur expéditeur non trouvé'
      });
    }

    if (accepter) {
      // Ajouter mutuellement comme amis
      utilisateur.amis.push(expediteur._id);
      expediteur.amis.push(utilisateur._id);

      // Notification d'acceptation
      expediteur.notifications.push({
        type: 'ami_accepte',
        message: `${utilisateur.prenom} ${utilisateur.nom} a accepté votre demande d'ami`,
        de: utilisateur._id
      });

      await expediteur.save();
    }

    // Supprimer la demande d'ami
    utilisateur.demandesAmis.pull(demande._id);
    await utilisateur.save();

    res.json({
      message: accepter ? 'Demande d\'ami acceptée' : 'Demande d\'ami refusée'
    });

  } catch (error) {
    console.error('Erreur lors de la réponse à la demande d\'ami:', error);
    res.status(500).json({
      error: 'Erreur lors de la réponse à la demande'
    });
  }
});

// @route   GET /api/users/demandes-amis
// @desc    Obtenir les demandes d'amis en attente
// @access  Privé
router.get('/demandes-amis', authentification, async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user._id)
      .populate('demandesAmis.de', 'nom prenom photo email');

    res.json({
      demandesAmis: utilisateur.demandesAmis
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes d\'amis:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des demandes'
    });
  }
});

// @route   DELETE /api/users/amis/:amiId
// @desc    Supprimer un ami
// @access  Privé
router.delete('/amis/:amiId', authentification, async (req, res) => {
  try {
    const amiId = req.params.amiId;
    const utilisateur = await User.findById(req.user._id);
    const ami = await User.findById(amiId);

    if (!ami) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    if (!utilisateur.amis.includes(amiId)) {
      return res.status(400).json({
        error: 'Cet utilisateur n\'est pas dans votre liste d\'amis'
      });
    }

    // Supprimer mutuellement de la liste d'amis
    utilisateur.amis.pull(amiId);
    ami.amis.pull(utilisateur._id);

    await utilisateur.save();
    await ami.save();

    res.json({
      message: 'Ami supprimé de votre liste'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'ami:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression'
    });
  }
});

// @route   GET /api/users/notifications
// @desc    Obtenir les notifications de l'utilisateur
// @access  Privé
router.get('/notifications', authentification, async (req, res) => {
  try {
    const { page = 1, limit = 20, nonLues = false } = req.query;
    const skip = (page - 1) * limit;

    const utilisateur = await User.findById(req.user._id)
      .populate('notifications.de', 'nom prenom photo');

    let notifications = utilisateur.notifications;

    if (nonLues === 'true') {
      notifications = notifications.filter(notif => !notif.lu);
    }

    // Trier par date de création (plus récentes en premier)
    notifications.sort((a, b) => b.dateCreation - a.dateCreation);

    // Pagination
    const notificationsPaginees = notifications.slice(skip, skip + parseInt(limit));

    res.json({
      notifications: notificationsPaginees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notifications.length,
        nonLues: utilisateur.notifications.filter(n => !n.lu).length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des notifications'
    });
  }
});

// @route   PUT /api/users/notifications/:notificationId/marquer-lu
// @desc    Marquer une notification comme lue
// @access  Privé
router.put('/notifications/:notificationId/marquer-lu', authentification, async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user._id);
    const notification = utilisateur.notifications.id(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        error: 'Notification non trouvée'
      });
    }

    notification.lu = true;
    await utilisateur.save();

    res.json({
      message: 'Notification marquée comme lue'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour'
    });
  }
});

module.exports = router;