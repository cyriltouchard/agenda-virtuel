const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function resetUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/agenda-virtuel');
    console.log('📦 Connexion à MongoDB réussie');

    // Supprimer tous les utilisateurs de test
    await User.deleteMany({ email: { $regex: /test\.com$/ } });
    console.log('🗑️ Anciens utilisateurs supprimés');

    // Créer un utilisateur super simple (le modèle va hasher automatiquement)
    const userData = {
      nom: 'Admin',
      prenom: 'Test',
      email: 'test@test.com',
      motDePasse: '123456', // Le pre-hook va le hasher automatiquement
      parametresVisibilite: {
        profil: 'public',
        agenda: 'public'
      }
    };

    const user = await User.create(userData);
    console.log('✅ Utilisateur créé avec succès');
    console.log('📧 Email: test@test.com');
    console.log('🔑 Mot de passe: 123456');
    
    // Test immédiat de la méthode de comparaison
    const testUser = await User.findOne({ email: 'test@test.com' }).select('+motDePasse');
    const result = await bcrypt.compare('123456', testUser.motDePasse);
    console.log('🔍 Test bcrypt direct:', result ? 'OK' : 'ÉCHEC');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Connexion fermée');
  }
}

resetUser();