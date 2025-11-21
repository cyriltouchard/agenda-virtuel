# Script pour démarrer l'application Docker
Write-Host "🚀 Démarrage de l'application Agenda Virtuel..." -ForegroundColor Green

# Vérifier si Docker Desktop est en cours d'exécution
$dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerProcess) {
    Write-Host "⚠️  Docker Desktop n'est pas en cours d'exécution. Veuillez le démarrer." -ForegroundColor Yellow
    exit 1
}

# Démarrer les conteneurs
docker-compose up -d

Write-Host ""
Write-Host "✅ Application démarrée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs d'accès:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:4200" -ForegroundColor White
Write-Host "   Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "   MongoDB:   mongodb://localhost:27017" -ForegroundColor White
Write-Host ""
Write-Host "📊 Vérifier l'état: docker-compose ps" -ForegroundColor Yellow
Write-Host "📋 Voir les logs:  docker-compose logs -f" -ForegroundColor Yellow
Write-Host "🛑 Arrêter:        docker-compose down" -ForegroundColor Yellow
