import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5000/api/auth';
  private readonly TOKEN_KEY = 'agenda_token';
  private readonly USER_KEY = 'agenda_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Vérifier si l'utilisateur est déjà connecté au démarrage
    this.checkAuthStatus();
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/inscription`, userData)
      .pipe(
        tap(response => {
          this.setAuthData(response.token, response.utilisateur);
        })
      );
  }

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/connexion`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response.token, response.utilisateur);
        })
      );
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Obtenir le profil utilisateur actuel
   */
  getProfile(): Observable<{ utilisateur: User }> {
    return this.http.get<{ utilisateur: User }>(`${this.API_URL}/profil`)
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.utilisateur);
          this.updateStoredUser(response.utilisateur);
        })
      );
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  updateProfile(userData: Partial<User>): Observable<{ message: string; utilisateur: User }> {
    return this.http.put<{ message: string; utilisateur: User }>(`${this.API_URL}/profil`, userData)
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.utilisateur);
          this.updateStoredUser(response.utilisateur);
        })
      );
  }

  /**
   * Changer le mot de passe
   */
  changePassword(ancienMotDePasse: string, nouveauMotDePasse: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/changer-mot-de-passe`, {
      ancienMotDePasse,
      nouveauMotDePasse
    });
  }

  /**
   * Vérifier si le token est valide
   */
  verifyToken(): Observable<{ valide: boolean; utilisateur: User }> {
    return this.http.post<{ valide: boolean; utilisateur: User }>(`${this.API_URL}/verifier-token`, {});
  }

  /**
   * Obtenir le token JWT
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Vérifier le statut d'authentification au démarrage
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem(this.USER_KEY);

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);

        // Vérifier si le token est toujours valide
        this.verifyToken().subscribe({
          next: (response) => {
            if (response.valide) {
              this.currentUserSubject.next(response.utilisateur);
              this.updateStoredUser(response.utilisateur);
            } else {
              this.logout();
            }
          },
          error: () => {
            this.logout();
          }
        });
      } catch (error) {
        this.logout();
      }
    }
  }

  /**
   * Stocker les données d'authentification
   */
  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Mettre à jour l'utilisateur stocké
   */
  private updateStoredUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}