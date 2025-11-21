# Script pour reconstruire et redémarrer l'application
Write-Host "🔄 Reconstruction de l'application..." -ForegroundColor Cyan

# Arrêter les conteneurs existants
Write-Host "Arrêt des conteneurs..." -ForegroundColor Yellow
docker-compose down

# Reconstruire les images
Write-Host "Reconstruction des images..." -ForegroundColor Yellow
docker-compose build --no-cache

# Démarrer les conteneurs
Write-Host "Démarrage des conteneurs..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "✅ Application reconstruite et redémarrée!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs d'accès:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:4200" -ForegroundColor White
Write-Host "   Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "   MongoDB:   mongodb://localhost:27017" -ForegroundColor White
