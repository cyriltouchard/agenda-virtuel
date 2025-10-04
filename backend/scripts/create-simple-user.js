const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createSimpleUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/agenda-virtuel');
    console.log('📦 Connexion à MongoDB réussie');

    // Supprimer l'ancien utilisateur s'il existe
    await User.deleteOne({ email: 'admin@test.com' });
    console.log('🗑️ Ancien utilisateur supprimé');

    // Créer un nouvel utilisateur avec un mot de passe simple
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const newUser = new User({
      nom: 'Test',
      prenom: 'Admin',
      email: 'admin@test.com',
      motDePasse: hashedPassword,
      parametresVisibilite: {
        profil: 'public',
        agenda: 'public'
      }
    });

    await newUser.save();
    console.log('✅ Nouvel utilisateur créé');
    
    // Tester la connexion
    const testUser = await User.findOne({ email: 'admin@test.com' }).select('+motDePasse');
    if (testUser) {
      const isValid = await testUser.comparerMotDePasse('admin123');
      console.log('🔑 Test mot de passe:', isValid ? 'RÉUSSI' : 'ÉCHEC');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Connexion fermée');
  }
}

createSimpleUser();