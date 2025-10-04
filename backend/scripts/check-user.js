const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/agenda-virtuel');
    console.log('📦 Connexion à MongoDB réussie');

    const user = await User.findOne({ email: 'admin@test.com' });
    
    if (user) {
      console.log('✅ Utilisateur trouvé:');
      console.log('📧 Email:', user.email);
      console.log('👤 Nom:', user.nom, user.prenom);
      
      // Tester le mot de passe
      const isValidPassword = await bcrypt.compare('admin123', user.motDePasse);
      console.log('🔑 Mot de passe valide:', isValidPassword ? 'OUI' : 'NON');
      
      if (!isValidPassword) {
        console.log('❌ Réinitialisation du mot de passe...');
        user.motDePasse = await bcrypt.hash('admin123', 12);
        await user.save();
        console.log('✅ Mot de passe réinitialisé');
      }
    } else {
      console.log('❌ Utilisateur non trouvé, création...');
      const newUser = await User.create({
        nom: 'Test',
        prenom: 'Admin',
        email: 'admin@test.com',
        motDePasse: await bcrypt.hash('admin123', 12),
        parametresVisibilite: {
          profil: 'public',
          agenda: 'public'
        }
      });
      console.log('✅ Utilisateur créé avec succès');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Connexion fermée');
  }
}

checkUser();