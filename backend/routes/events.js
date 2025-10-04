const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const { authentification } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Obtenir les événements de l'utilisateur
// @access  Privé
router.get('/', authentification, async (req, res) => {
  try {
    const { 
      dateDebut, 
      dateFin, 
      categorie, 
      visibilite,
      page = 1, 
      limit = 50 
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Construire le filtre de base
    let filtre = {
      $or: [
        { proprietaire: req.user._id }, // Événements de l'utilisateur
        { 
          visibilite: 'public' // Événements publics
        },
        {
          visibilite: 'amis',
          proprietaire: { $in: req.user.amis } // Événements d'amis
        },
        {
          'participants.utilisateur': req.user._id // Événements où l'utilisateur est invité
        }
      ]
    };

    // Ajouter des filtres conditionnels
    if (dateDebut && dateFin) {
      filtre.dateDebut = {
        $gte: new Date(dateDebut),
        $lte: new Date(dateFin)
      };
    }

    if (categorie) {
      filtre.categorie = categorie;
    }

    if (visibilite) {
      filtre.visibilite = visibilite;
    }

    const evenements = await Event.find(filtre)
      .populate('proprietaire', 'nom prenom photo')
      .populate('participants.utilisateur', 'nom prenom photo')
      .populate('commentaires.auteur', 'nom prenom photo')
      .sort({ dateDebut: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Event.countDocuments(filtre);

    res.json({
      evenements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des événements'
    });
  }
});

// @route   GET /api/events/:id
// @desc    Obtenir un événement spécifique
// @access  Privé
router.get('/:id', authentification, async (req, res) => {
  try {
    const evenement = await Event.findById(req.params.id)
      .populate('proprietaire', 'nom prenom photo email')
      .populate('participants.utilisateur', 'nom prenom photo')
      .populate('commentaires.auteur', 'nom prenom photo');

    if (!evenement) {
      return res.status(404).json({
        error: 'Événement non trouvé'
      });
    }

    // Vérifier si l'utilisateur peut voir cet événement
    const peutVoir = evenement.peutVoir(req.user._id, req.user.amis);
    
    if (!peutVoir) {
      return res.status(403).json({
        error: 'Accès refusé à cet événement'
      });
    }

    res.json({
      evenement
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'événement'
    });
  }
});

// @route   POST /api/events
// @desc    Créer un nouvel événement
// @access  Privé
router.post('/', [
  authentification,
  body('titre')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le titre est requis et ne peut pas dépasser 100 caractères'),
  body('dateDebut')
    .isISO8601()
    .withMessage('Date de début invalide'),
  body('dateFin')
    .isISO8601()
    .withMessage('Date de fin invalide'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),
  body('lieu')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Le lieu ne peut pas dépasser 200 caractères'),
  body('categorie')
    .optional()
    .isIn(['travail', 'personnel', 'etudes', 'sante', 'loisirs', 'famille', 'autre'])
    .withMessage('Catégorie invalide'),
  body('visibilite')
    .optional()
    .isIn(['public', 'amis', 'prive'])
    .withMessage('Niveau de visibilité invalide'),
  body('couleur')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Format de couleur invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const {
      titre,
      description,
      dateDebut,
      dateFin,
      touteLaJournee,
      lieu,
      categorie,
      couleur,
      visibilite,
      rappels,
      tags
    } = req.body;

    // Validation des dates
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    if (fin <= debut) {
      return res.status(400).json({
        error: 'La date de fin doit être postérieure à la date de début'
      });
    }

    const nouvelEvenement = new Event({
      titre,
      description,
      dateDebut: debut,
      dateFin: fin,
      touteLaJournee: touteLaJournee || false,
      lieu,
      categorie: categorie || 'personnel',
      couleur: couleur || '#3498db',
      visibilite: visibilite || 'prive',
      proprietaire: req.user._id,
      rappels: rappels || [{ type: 'notification', tempsDAvance: 15 }],
      tags: tags || []
    });

    await nouvelEvenement.save();

    const evenement = await Event.findById(nouvelEvenement._id)
      .populate('proprietaire', 'nom prenom photo');

    res.status(201).json({
      message: 'Événement créé avec succès',
      evenement
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'événement'
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Mettre à jour un événement
// @access  Privé
router.put('/:id', [
  authentification,
  body('titre')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le titre ne peut pas dépasser 100 caractères'),
  body('dateDebut')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  body('dateFin')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),
  body('lieu')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Le lieu ne peut pas dépasser 200 caractères'),
  body('categorie')
    .optional()
    .isIn(['travail', 'personnel', 'etudes', 'sante', 'loisirs', 'famille', 'autre']),
  body('visibilite')
    .optional()
    .isIn(['public', 'amis', 'prive']),
  body('couleur')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const evenement = await Event.findById(req.params.id);
    
    if (!evenement) {
      return res.status(404).json({
        error: 'Événement non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (evenement.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cet événement'
      });
    }

    // Validation des dates si elles sont fournies
    if (req.body.dateDebut && req.body.dateFin) {
      const debut = new Date(req.body.dateDebut);
      const fin = new Date(req.body.dateFin);
      
      if (fin <= debut) {
        return res.status(400).json({
          error: 'La date de fin doit être postérieure à la date de début'
        });
      }
    }

    const champsAMettreAJour = { ...req.body };
    delete champsAMettreAJour.proprietaire; // Empêcher la modification du propriétaire

    const evenementMisAJour = await Event.findByIdAndUpdate(
      req.params.id,
      champsAMettreAJour,
      { new: true, runValidators: true }
    ).populate('proprietaire', 'nom prenom photo');

    res.json({
      message: 'Événement mis à jour avec succès',
      evenement: evenementMisAJour
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de l\'événement'
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Supprimer un événement
// @access  Privé
router.delete('/:id', authentification, async (req, res) => {
  try {
    const evenement = await Event.findById(req.params.id);
    
    if (!evenement) {
      return res.status(404).json({
        error: 'Événement non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (evenement.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cet événement'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Événement supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression de l\'événement'
    });
  }
});

// @route   POST /api/events/:id/commentaires
// @desc    Ajouter un commentaire à un événement
// @access  Privé
router.post('/:id/commentaires', [
  authentification,
  body('contenu')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Le commentaire est requis et ne peut pas dépasser 500 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const evenement = await Event.findById(req.params.id);
    
    if (!evenement) {
      return res.status(404).json({
        error: 'Événement non trouvé'
      });
    }

    // Vérifier si l'utilisateur peut voir cet événement
    const peutVoir = evenement.peutVoir(req.user._id, req.user.amis);
    
    if (!peutVoir) {
      return res.status(403).json({
        error: 'Accès refusé à cet événement'
      });
    }

    const nouveauCommentaire = {
      auteur: req.user._id,
      contenu: req.body.contenu,
      dateCreation: new Date()
    };

    evenement.commentaires.push(nouveauCommentaire);
    await evenement.save();

    // Notifier le propriétaire si ce n'est pas lui qui commente
    if (evenement.proprietaire.toString() !== req.user._id.toString()) {
      const proprietaire = await User.findById(evenement.proprietaire);
      proprietaire.notifications.push({
        type: 'commentaire',
        message: `${req.user.prenom} ${req.user.nom} a commenté votre événement "${evenement.titre}"`,
        de: req.user._id
      });
      await proprietaire.save();
    }

    const evenementMisAJour = await Event.findById(req.params.id)
      .populate('commentaires.auteur', 'nom prenom photo');

    res.status(201).json({
      message: 'Commentaire ajouté avec succès',
      commentaires: evenementMisAJour.commentaires
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'ajout du commentaire'
    });
  }
});

// @route   POST /api/events/:id/partager
// @desc    Partager un événement avec d'autres utilisateurs
// @access  Privé
router.post('/:id/partager', [
  authentification,
  body('utilisateurs')
    .isArray({ min: 1 })
    .withMessage('Au moins un utilisateur doit être spécifié'),
  body('utilisateurs.*')
    .isMongoId()
    .withMessage('ID utilisateur invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const evenement = await Event.findById(req.params.id);
    
    if (!evenement) {
      return res.status(404).json({
        error: 'Événement non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (evenement.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Seul le propriétaire peut partager cet événement'
      });
    }

    const { utilisateurs } = req.body;

    // Ajouter les utilisateurs comme participants
    for (const utilisateurId of utilisateurs) {
      // Vérifier si l'utilisateur existe
      const utilisateur = await User.findById(utilisateurId);
      if (!utilisateur) {
        continue;
      }

      // Vérifier si l'utilisateur n'est pas déjà participant
      const dejaParticipant = evenement.participants.some(
        p => p.utilisateur.toString() === utilisateurId
      );

      if (!dejaParticipant) {
        evenement.participants.push({
          utilisateur: utilisateurId,
          statut: 'invite',
          dateReponse: null
        });

        // Ajouter une notification
        utilisateur.notifications.push({
          type: 'evenement_partage',
          message: `${req.user.prenom} ${req.user.nom} a partagé l'événement "${evenement.titre}" avec vous`,
          de: req.user._id
        });
        await utilisateur.save();
      }
    }

    await evenement.save();

    res.json({
      message: 'Événement partagé avec succès',
      participants: evenement.participants
    });

  } catch (error) {
    console.error('Erreur lors du partage de l\'événement:', error);
    res.status(500).json({
      error: 'Erreur lors du partage de l\'événement'
    });
  }
});

module.exports = router;