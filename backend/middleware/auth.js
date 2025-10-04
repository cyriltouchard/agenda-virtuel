const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour vérifier l'authentification JWT
const authentification = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Accès refusé. Token manquant.'
      });
    }
    
    // Extraire le token (format: "Bearer TOKEN")
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    if (!token) {
      return res.status(401).json({
        error: 'Accès refusé. Format de token invalide.'
      });
    }
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id).select('-motDePasse');
    
    if (!user) {
      return res.status(401).json({
        error: 'Token invalide. Utilisateur non trouvé.'
      });
    }
    
    if (!user.actif) {
      return res.status(401).json({
        error: 'Compte utilisateur désactivé.'
      });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré. Veuillez vous reconnecter.'
      });
    }
    
    return res.status(500).json({
      error: 'Erreur lors de la vérification du token.'
    });
  }
};

// Middleware optionnel pour l'authentification (n'échoue pas si pas de token)
const authentificationOptionnelle = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-motDePasse');
    
    if (user && user.actif) {
      req.user = user;
    } else {
      req.user = null;
    }
    
    next();
    
  } catch (error) {
    req.user = null;
    next();
  }
};

// Middleware pour vérifier les rôles (pour des fonctionnalités futures)
const verifierRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Permissions insuffisantes.'
      });
    }
    
    next();
  };
};

// Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
const verifierProprietaire = (modelName) => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}`);
      const ressource = await Model.findById(req.params.id);
      
      if (!ressource) {
        return res.status(404).json({
          error: 'Ressource non trouvée.'
        });
      }
      
      if (ressource.proprietaire.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette ressource.'
        });
      }
      
      req.ressource = ressource;
      next();
      
    } catch (error) {
      console.error('Erreur lors de la vérification du propriétaire:', error);
      return res.status(500).json({
        error: 'Erreur lors de la vérification des permissions.'
      });
    }
  };
};

module.exports = {
  authentification,
  authentificationOptionnelle,
  verifierRole,
  verifierProprietaire
};