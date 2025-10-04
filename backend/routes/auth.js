const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authentification } = require('../middleware/auth');

const router = express.Router();

// Fonction utilitaire pour générer un JWT
const genererToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
};

// @route   POST /api/auth/inscription
// @desc    Inscription d'un nouvel utilisateur
// @access  Public
router.post('/inscription', [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('prenom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('motDePasse')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { nom, prenom, email, motDePasse } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await User.findOne({ email });
    if (utilisateurExistant) {
      return res.status(400).json({
        error: 'Un compte avec cet email existe déjà'
      });
    }

    // Créer un nouvel utilisateur
    const nouvelUtilisateur = new User({
      nom,
      prenom,
      email,
      motDePasse
    });

    await nouvelUtilisateur.save();

    // Générer un token JWT
    const token = genererToken(nouvelUtilisateur._id);

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const utilisateur = await User.findById(nouvelUtilisateur._id).select('-motDePasse');

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      utilisateur
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du compte'
    });
  }
});

// @route   POST /api/auth/connexion
// @desc    Connexion utilisateur
// @access  Public
router.post('/connexion', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('motDePasse')
    .notEmpty()
    .withMessage('Mot de passe requis')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, motDePasse } = req.body;

    // Trouver l'utilisateur et inclure le mot de passe pour la vérification
    const utilisateur = await User.findOne({ email }).select('+motDePasse');
    
    if (!utilisateur) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const motDePasseValide = await utilisateur.comparerMotDePasse(motDePasse);
    
    if (!motDePasseValide) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Mettre à jour la dernière connexion
    utilisateur.dernierConnexion = new Date();
    await utilisateur.save();

    // Générer un token JWT
    const token = genererToken(utilisateur._id);

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const utilisateurSansMotDePasse = await User.findById(utilisateur._id).select('-motDePasse');

    res.json({
      message: 'Connexion réussie',
      token,
      utilisateur: utilisateurSansMotDePasse
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur lors de la connexion'
    });
  }
});

// @route   GET /api/auth/profil
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Privé
router.get('/profil', authentification, async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user._id)
      .select('-motDePasse')
      .populate('amis', 'nom prenom email photo');

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

// @route   PUT /api/auth/profil
// @desc    Mettre à jour le profil utilisateur
// @access  Privé
router.put('/profil', [
  authentification,
  body('nom').optional().trim().isLength({ min: 2, max: 50 }),
  body('prenom').optional().trim().isLength({ min: 2, max: 50 }),
  body('bio').optional().isLength({ max: 200 }),
  body('parametresVisibilite.profil').optional().isIn(['public', 'amis', 'prive']),
  body('parametresVisibilite.agenda').optional().isIn(['public', 'amis', 'prive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { nom, prenom, bio, parametresVisibilite } = req.body;

    const champsAMettreAJour = {};
    
    if (nom) champsAMettreAJour.nom = nom;
    if (prenom) champsAMettreAJour.prenom = prenom;
    if (bio !== undefined) champsAMettreAJour.bio = bio;
    if (parametresVisibilite) champsAMettreAJour.parametresVisibilite = parametresVisibilite;

    const utilisateur = await User.findByIdAndUpdate(
      req.user._id,
      champsAMettreAJour,
      { new: true, runValidators: true }
    ).select('-motDePasse');

    res.json({
      message: 'Profil mis à jour avec succès',
      utilisateur
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du profil'
    });
  }
});

// @route   POST /api/auth/changer-mot-de-passe
// @desc    Changer le mot de passe
// @access  Privé
router.post('/changer-mot-de-passe', [
  authentification,
  body('ancienMotDePasse').notEmpty().withMessage('Ancien mot de passe requis'),
  body('nouveauMotDePasse')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const utilisateur = await User.findById(req.user._id).select('+motDePasse');

    // Vérifier l'ancien mot de passe
    const ancienMotDePasseValide = await utilisateur.comparerMotDePasse(ancienMotDePasse);
    
    if (!ancienMotDePasseValide) {
      return res.status(400).json({
        error: 'Ancien mot de passe incorrect'
      });
    }

    // Mettre à jour le mot de passe
    utilisateur.motDePasse = nouveauMotDePasse;
    await utilisateur.save();

    res.json({
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      error: 'Erreur lors du changement de mot de passe'
    });
  }
});

// @route   POST /api/auth/verifier-token
// @desc    Vérifier si le token est valide
// @access  Privé
router.post('/verifier-token', authentification, (req, res) => {
  res.json({
    valide: true,
    utilisateur: req.user
  });
});

module.exports = router;