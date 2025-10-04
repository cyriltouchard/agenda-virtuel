#!/bin/bash
cd "/c/Users/cyril/OneDrive/Bureau/agendaVirtuel/backend"
echo "Démarrage du serveur backend en arrière-plan..."
nohup node server.js > backend.log 2>&1 &
echo "PID du serveur: $!"
echo "Le serveur tourne maintenant en arrière-plan"
echo "Pour voir les logs: tail -f backend.log"
echo "Pour arrêter: kill $!"