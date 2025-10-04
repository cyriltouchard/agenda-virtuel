const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas renvoyer le mot de passe par défaut dans les requêtes
  },
  photo: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [200, 'La bio ne peut pas dépasser 200 caractères'],
    default: ''
  },
  parametresVisibilite: {
    profil: {
      type: String,
      enum: ['public', 'amis', 'prive'],
      default: 'amis'
    },
    agenda: {
      type: String,
      enum: ['public', 'amis', 'prive'],
      default: 'prive'
    }
  },
  amis: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  demandesAmis: [{
    de: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateDemande: {
      type: Date,
      default: Date.now
    }
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['ami_demande', 'ami_accepte', 'evenement_partage', 'commentaire'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    de: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lu: {
      type: Boolean,
      default: false
    },
    dateCreation: {
      type: Date,
      default: Date.now
    }
  }],
  dernierConnexion: {
    type: Date,
    default: Date.now
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
userSchema.index({ email: 1 });
userSchema.index({ nom: 1, prenom: 1 });

// Middleware pre-save pour hasher le mot de passe
userSchema.pre('save', async function(next) {
  // Si le mot de passe n'a pas été modifié, passer au suivant
  if (!this.isModified('motDePasse')) return next();
  
  try {
    // Hasher le mot de passe avec un salt de 12
    const salt = await bcrypt.genSalt(12);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparerMotDePasse = async function(motDePasseCandidat) {
  return await bcrypt.compare(motDePasseCandidat, this.motDePasse);
};

// Méthode pour obtenir le nom complet
userSchema.virtual('nomComplet').get(function() {
  return `${this.prenom} ${this.nom}`;
});

// S'assurer que les virtuals soient inclus dans la sérialisation JSON
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);