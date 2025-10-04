import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile-container">
      <h1>Mon Profil</h1>
      <mat-card>
        <mat-card-content>
          <p>Gestion du profil utilisateur - À implémenter</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 2rem;
    }
  `]
})
export class ProfileComponent {}