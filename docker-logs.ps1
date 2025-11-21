# Script pour voir les logs en temps réel
Write-Host "📋 Affichage des logs de l'application..." -ForegroundColor Cyan
Write-Host "   (Appuyez sur Ctrl+C pour quitter)" -ForegroundColor Yellow
Write-Host ""

docker-compose logs -f
