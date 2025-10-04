import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  isAuthenticated = false;
  isDarkMode = false;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Observer l'état d'authentification
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });

    // Observer le thème
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Bascule le thème
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Basculer le menu mobile
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Navigation vers le profil
   */
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.isMenuOpen = false;
  }

  /**
   * Navigation vers les paramètres
   */
  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.isMenuOpen = false;
  }

  /**
   * Navigation vers les amis
   */
  navigateToFriends(): void {
    this.router.navigate(['/friends']);
    this.isMenuOpen = false;
  }

  /**
   * Navigation vers les groupes
   */
  navigateToGroups(): void {
    this.router.navigate(['/groups']);
    this.isMenuOpen = false;
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  /**
   * Navigation vers la connexion
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navigation vers l'inscription
   */
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Navigation vers l'accueil
   */
  navigateToHome(): void {
    this.router.navigate(['/']);
    this.isMenuOpen = false;
  }

  /**
   * Obtenir les initiales de l'utilisateur
   */
  getUserInitials(): string {
    if (!this.currentUser) return '';
    
    const firstInitial = this.currentUser.prenom?.charAt(0).toUpperCase() || '';
    const lastInitial = this.currentUser.nom?.charAt(0).toUpperCase() || '';
    
    return firstInitial + lastInitial;
  }

  /**
   * Fermer le menu si on clique en dehors
   */
  closeMenu(): void {
    this.isMenuOpen = false;
  }
}