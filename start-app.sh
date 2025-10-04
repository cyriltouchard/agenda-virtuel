#!/bin/bash

echo "🚀 Démarrage de l'Agenda Virtuel"
echo "================================="

# Vérifier si les ports sont libres
echo "🔍 Vérification des ports..."

BACKEND_PORT=5000
FRONTEND_PORT=4200

if netstat -an | grep ":$BACKEND_PORT" > /dev/null; then
    echo "✅ Backend déjà actif sur le port $BACKEND_PORT"
else
    echo "🔧 Démarrage du backend..."
    cd backend
    npm start &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    cd ..
fi

if netstat -an | grep ":$FRONTEND_PORT" > /dev/null; then
    echo "✅ Frontend déjà actif sur le port $FRONTEND_PORT"
else
    echo "🎨 Démarrage du frontend..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    cd ..
fi

echo ""
echo "🌐 Application disponible sur:"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo "   Backend API: http://localhost:$BACKEND_PORT"
echo ""
echo "💡 Pour arrêter les serveurs:"
echo "   Ctrl+C dans ce terminal ou:"
echo "   pkill -f 'ng serve'"
echo "   pkill -f 'node server.js'"