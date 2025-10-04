const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  dateDebut: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  dateFin: {
    type: Date,
    required: [true, 'La date de fin est requise']
  },
  touteLaJournee: {
    type: Boolean,
    default: false
  },
  lieu: {
    type: String,
    trim: true,
    maxlength: [200, 'Le lieu ne peut pas dépasser 200 caractères']
  },
  categorie: {
    type: String,
    enum: ['travail', 'personnel', 'etudes', 'sante', 'loisirs', 'famille', 'autre'],
    default: 'personnel'
  },
  couleur: {
    type: String,
    default: '#3498db',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Format de couleur invalide']
  },
  visibilite: {
    type: String,
    enum: ['public', 'amis', 'prive'],
    default: 'prive'
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    statut: {
      type: String,
      enum: ['invite', 'accepte', 'decline', 'tentative'],
      default: 'invite'
    },
    dateReponse: {
      type: Date
    }
  }],
  rappels: [{
    type: {
      type: String,
      enum: ['email', 'notification', 'popup'],
      default: 'notification'
    },
    tempsDAvance: {
      type: Number, // en minutes
      default: 15
    }
  }],
  fichiers: [{
    nom: String,
    url: String,
    type: String,
    taille: Number,
    dateUpload: {
      type: Date,
      default: Date.now
    }
  }],
  liens: [{
    titre: String,
    url: String,
    description: String
  }],
  commentaires: [{
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    contenu: {
      type: String,
      required: true,
      maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
    },
    dateCreation: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  recurrence: {
    type: {
      type: String,
      enum: ['aucune', 'quotidien', 'hebdomadaire', 'mensuel', 'annuel'],
      default: 'aucune'
    },
    intervalle: {
      type: Number,
      default: 1
    },
    joursSemaine: [Number], // 0=dimanche, 1=lundi, etc.
    jourMois: Number, // jour du mois pour récurrence mensuelle
    dateFin: Date // date de fin de récurrence
  },
  evenementParent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event' // pour les événements récurrents
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
eventSchema.index({ proprietaire: 1, dateDebut: 1 });
eventSchema.index({ dateDebut: 1, dateFin: 1 });
eventSchema.index({ visibilite: 1 });
eventSchema.index({ categorie: 1 });
eventSchema.index({ tags: 1 });

// Validation personnalisée : la date de fin doit être après la date de début
eventSchema.pre('save', function(next) {
  if (this.dateFin <= this.dateDebut) {
    const error = new Error('La date de fin doit être postérieure à la date de début');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Méthode pour vérifier si un utilisateur peut voir cet événement
eventSchema.methods.peutVoir = function(utilisateurId, amisUtilisateur = []) {
  // Si c'est le propriétaire
  if (this.proprietaire.toString() === utilisateurId.toString()) {
    return true;
  }
  
  // Si l'événement est public
  if (this.visibilite === 'public') {
    return true;
  }
  
  // Si l'événement est pour les amis et l'utilisateur est ami
  if (this.visibilite === 'amis') {
    return amisUtilisateur.some(ami => ami.toString() === this.proprietaire.toString());
  }
  
  // Si l'événement est privé, seul le propriétaire peut le voir
  return false;
};

// Virtual pour la durée de l'événement en minutes
eventSchema.virtual('dureeMinutes').get(function() {
  return Math.round((this.dateFin - this.dateDebut) / (1000 * 60));
});

eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);