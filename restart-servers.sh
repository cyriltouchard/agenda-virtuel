#!/bin/bash

echo "🛑 Arrêt des serveurs..."

# Arrêter tous les processus Node.js
echo "Arrêt des processus Node.js..."
taskkill //f //im node.exe 2>/dev/null || echo "Aucun processus Node.js à arrêter"

# Attendre un peu
sleep 2

echo "🚀 Redémarrage des serveurs..."

# Démarrer le backend
echo "Démarrage du backend..."
cd "/c/Users/cyril/OneDrive/Bureau/agendaVirtuel/backend"
npm start &
BACKEND_PID=$!
echo "Backend démarré (PID: $BACKEND_PID)"

# Attendre que le backend soit prêt
sleep 3

# Démarrer le frontend
echo "Démarrage du frontend..."
cd "/c/Users/cyril/OneDrive/Bureau/agendaVirtuel/frontend"
npm start &
FRONTEND_PID=$!
echo "Frontend démarré (PID: $FRONTEND_PID)"

echo ""
echo "✅ Serveurs redémarrés !"
echo "📱 Frontend: http://localhost:4200"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "Pour arrêter :"
echo "  kill $BACKEND_PID $FRONTEND_PID"