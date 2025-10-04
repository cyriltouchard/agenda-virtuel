import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<NotificationMessage[]>([]);
  public notifications$ = this.notifications.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Afficher un message de succès
   */
  showSuccess(message: string, duration = 3000): void {
    this.showSnackBar(message, 'success', duration);
    this.addNotification('success', message, duration);
  }

  /**
   * Afficher un message d'erreur
   */
  showError(message: string, duration = 5000): void {
    this.showSnackBar(message, 'error', duration);
    this.addNotification('error', message, duration);
  }

  /**
   * Afficher un message d'avertissement
   */
  showWarning(message: string, duration = 4000): void {
    this.showSnackBar(message, 'warning', duration);
    this.addNotification('warning', message, duration);
  }

  /**
   * Afficher un message d'information
   */
  showInfo(message: string, duration = 3000): void {
    this.showSnackBar(message, 'info', duration);
    this.addNotification('info', message, duration);
  }

  /**
   * Afficher une SnackBar Material
   */
  private showSnackBar(message: string, type: string, duration: number): void {
    const config = {
      duration: duration,
      horizontalPosition: 'right' as const,
      verticalPosition: 'top' as const,
      panelClass: [`snackbar-${type}`]
    };

    this.snackBar.open(message, 'Fermer', config);
  }

  /**
   * Ajouter une notification à la liste
   */
  private addNotification(type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number): void {
    const notification: NotificationMessage = {
      id: this.generateId(),
      type,
      message,
      duration,
      timestamp: new Date()
    };

    const currentNotifications = this.notifications.value;
    this.notifications.next([notification, ...currentNotifications]);

    // Supprimer automatiquement la notification après la durée spécifiée
    if (duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }
  }

  /**
   * Supprimer une notification
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notifications.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications.next(filteredNotifications);
  }

  /**
   * Effacer toutes les notifications
   */
  clearAllNotifications(): void {
    this.notifications.next([]);
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  getUnreadCount(): number {
    return this.notifications.value.length;
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}