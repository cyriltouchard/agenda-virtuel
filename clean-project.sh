#!/bin/bash

echo "🧹 Nettoyage du projet Agenda Virtuel..."

# Nettoyage du frontend
echo "📁 Nettoyage du cache Angular..."
cd "/c/Users/cyril/OneDrive/Bureau/agendaVirtuel/frontend"
rm -rf .angular/cache/*
rm -rf dist/*

echo "📦 Nettoyage des node_modules et reinstallation..."
rm -rf node_modules
npm cache clean --force
npm install

# Nettoyage du backend
echo "🔧 Nettoyage du backend..."
cd "/c/Users/cyril/OneDrive/Bureau/agendaVirtuel/backend"
rm -rf node_modules
rm -f *.log
npm cache clean --force
npm install

echo "✅ Nettoyage terminé !"
echo ""
echo "🚀 Pour redémarrer l'application :"
echo "   Backend: cd backend && npm start"
echo "   Frontend: cd frontend && npm start"