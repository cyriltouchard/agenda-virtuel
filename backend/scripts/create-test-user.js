const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agenda-virtuel';

async function createTestUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connexion à MongoDB réussie');

    // Créer un utilisateur de test
    const testUser = {
      nom: 'Test',
      prenom: 'Admin',
      email: 'admin@test.com',
      motDePasse: await bcrypt.hash('admin123', 12),
      parametresVisibilite: {
        profil: 'public',
        agenda: 'public'
      }
    };

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('👤 Utilisateur de test existe déjà:', testUser.email);
      console.log('🔑 Mot de passe: admin123');
      return existingUser;
    }

    // Créer l'utilisateur
    const user = await User.create(testUser);
    console.log('✅ Utilisateur de test créé avec succès:');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Mot de passe: admin123');

    // Créer quelques événements de démonstration
    const now = new Date();
    const demoEvents = [
      {
        titre: 'Réunion équipe',
        description: 'Réunion hebdomadaire de l\'équipe de développement',
        dateDebut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
        dateFin: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0),
        touteLaJournee: false,
        lieu: 'Salle de conférence A',
        categorie: 'travail',
        couleur: '#3498db',
        visibilite: 'prive',
        proprietaire: user._id
      },
      {
        titre: 'Anniversaire de Marie',
        description: 'Fête d\'anniversaire chez Marie',
        dateDebut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        dateFin: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        touteLaJournee: true,
        lieu: 'Chez Marie',
        categorie: 'personnel',
        couleur: '#e74c3c',
        visibilite: 'amis',
        proprietaire: user._id
      },
      {
        titre: 'Sport - Course à pied',
        description: 'Session de running matinale',
        dateDebut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 7, 0),
        dateFin: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 8, 0),
        touteLaJournee: false,
        lieu: 'Parc de la ville',
        categorie: 'sante',
        couleur: '#2ecc71',
        visibilite: 'public',
        proprietaire: user._id
      },
      {
        titre: 'Cours Angular',
        description: 'Formation Angular avancée',
        dateDebut: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
        dateFin: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0),
        touteLaJournee: false,
        lieu: 'Centre de formation',
        categorie: 'etudes',
        couleur: '#9b59b6',
        visibilite: 'prive',
        proprietaire: user._id
      },
      {
        titre: 'Vacances été',
        description: 'Vacances en famille à la mer',
        dateDebut: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        dateFin: new Date(now.getFullYear(), now.getMonth() + 1, 25),
        touteLaJournee: true,
        lieu: 'Nice, France',
        categorie: 'famille',
        couleur: '#f39c12',
        visibilite: 'amis',
        proprietaire: user._id
      }
    ];

    await Event.insertMany(demoEvents);
    console.log('🎉 Événements de démonstration créés:', demoEvents.length);

    return user;

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Connexion fermée');
  }
}

// Exécuter le script
if (require.main === module) {
  createTestUser().then(() => {
    console.log('\n🚀 Script terminé. Vous pouvez maintenant vous connecter avec:');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Mot de passe: admin123');
    process.exit(0);
  });
}

module.exports = createTestUser;