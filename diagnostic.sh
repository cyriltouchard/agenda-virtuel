#!/bin/bash

echo "=== Diagnostic des serveurs ==="
echo "Vérification du port 5000 (backend):"
netstat -an | grep ":5000" || echo "Port 5000 non utilisé"

echo ""
echo "Vérification du port 4201 (frontend):"
netstat -an | grep ":4201" || echo "Port 4201 non utilisé"

echo ""
echo "Test de connexion au backend:"
curl -s http://localhost:5000/api/health 2>/dev/null && echo "Backend accessible" || echo "Backend inaccessible"

echo ""
echo "Processus Node.js en cours:"
ps aux | grep node | grep -v grep || echo "Aucun processus Node.js trouvé"