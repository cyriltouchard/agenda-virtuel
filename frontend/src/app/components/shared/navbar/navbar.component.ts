import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <mat-toolbar color="primary" class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <mat-icon>calendar_today</mat-icon>
          <span class="app-name">Agenda Virtuel</span>
        </div>
        
        <div class="nav-links">
          <a mat-button routerLink="/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            <span>Tableau de bord</span>
          </a>
          <a mat-button routerLink="/calendar" routerLinkActive="active">
            <mat-icon>event</mat-icon>
            <span>Calendrier</span>
          </a>
          <a mat-button routerLink="/events" routerLinkActive="active">
            <mat-icon>list</mat-icon>
            <span>Événements</span>
          </a>
        </div>
        
        <div class="nav-user">
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>Profil</span>
            </button>
            <button mat-menu-item routerLink="/notifications">
              <mat-icon matBadge="3" matBadgeColor="accent">notifications</mat-icon>
              <span>Notifications</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Déconnexion</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .nav-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }
    
    .nav-links {
      display: flex;
      gap: 0.5rem;
    }
    
    .nav-links a {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .nav-user {
      display: flex;
      align-items: center;
    }
    
    @media (max-width: 768px) {
      .nav-links span,
      .app-name {
        display: none;
      }
      
      .nav-container {
        padding: 0 0.5rem;
      }
    }
  `]
})
export class NavbarComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
  }
}