#!/bin/bash
cd "/c/Users/cyril/OneDrive/Bureau/agendaVirtuel/backend"
echo "Démarrage du serveur backend..."
echo "Répertoire actuel: $(pwd)"
echo "Contenu du répertoire:"
ls -la
echo ""
echo "Vérification de Node.js:"
node --version
echo ""
echo "Démarrage de server.js..."
exec node server.js