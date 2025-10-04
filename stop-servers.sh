#!/bin/bash

echo "🛑 Arrêt de tous les serveurs..."

# Arrêter les processus Node.js
echo "Arrêt des processus Node.js..."
taskkill //f //im node.exe 2>/dev/null || echo "Aucun processus Node.js trouvé"

# Vérifier les ports
echo "Vérification des ports..."
if netstat -ano | findstr :5000 > /dev/null; then
    echo "⚠️ Port 5000 encore utilisé"
else
    echo "✅ Port 5000 libre"
fi

if netstat -ano | findstr :4200 > /dev/null; then
    echo "⚠️ Port 4200 encore utilisé"  
else
    echo "✅ Port 4200 libre"
fi

echo "🛑 Arrêt terminé !"