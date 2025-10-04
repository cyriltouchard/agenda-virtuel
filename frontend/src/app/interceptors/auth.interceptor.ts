import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Récupérer le token JWT
    const token = this.authService.getToken();

    // Cloner la requête et ajouter l'en-tête d'autorisation si un token existe
    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    // Exécuter la requête et gérer les erreurs
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gestion des erreurs d'authentification
        if (error.status === 401) {
          // Token expiré ou invalide
          this.authService.logout();
          this.notificationService.showError('Session expirée. Veuillez vous reconnecter.');
        } else if (error.status === 403) {
          // Accès refusé
          this.notificationService.showError('Accès refusé. Permissions insuffisantes.');
        } else if (error.status === 500) {
          // Erreur serveur
          this.notificationService.showError('Erreur serveur. Veuillez réessayer plus tard.');
        } else if (error.status === 0) {
          // Erreur de connexion
          this.notificationService.showError('Impossible de se connecter au serveur.');
        } else {
          // Autres erreurs
          const message = error.error?.error || error.error?.message || 'Une erreur est survenue';
          this.notificationService.showError(message);
        }

        return throwError(() => error);
      })
    );
  }
}