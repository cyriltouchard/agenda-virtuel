import { Component } from '@angular/core';

@Component({
  selector: 'app-notifications',
  template: `
    <div class="notifications-container">
      <h1>Notifications</h1>
      <mat-card>
        <mat-card-content>
          <p>Gestion des notifications - À implémenter</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .notifications-container {
      padding: 2rem;
    }
  `]
})
export class NotificationsComponent {}