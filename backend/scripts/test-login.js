const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/connexion', {
      email: 'admin@test.com',
      motDePasse: 'admin123'
    });
    
    console.log('✅ Connexion réussie !');
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    console.log('Utilisateur:', response.data.utilisateur.nom, response.data.utilisateur.prenom);
    
  } catch (error) {
    console.log('❌ Erreur de connexion:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Erreur:', error.response.data.error);
    } else {
      console.log('Erreur réseau:', error.message);
    }
  }
}

testLogin();