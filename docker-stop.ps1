# Script pour arrêter l'application Docker
Write-Host "🛑 Arrêt de l'application Agenda Virtuel..." -ForegroundColor Yellow

docker-compose down

Write-Host ""
Write-Host "✅ Application arrêtée avec succès!" -ForegroundColor Green
