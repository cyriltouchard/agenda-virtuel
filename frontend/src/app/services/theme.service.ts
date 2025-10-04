import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Theme, lightTheme, darkTheme } from '../config/theme.config';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'agenda-theme';
  private currentThemeSubject = new BehaviorSubject<Theme>(lightTheme);
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  /**
   * Initialise le thème au démarrage de l'application
   */
  private initializeTheme(): void {
    // Vérifier la préférence sauvegardée
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    // Détecter la préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Déterminer le thème à utiliser
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    this.setTheme(shouldUseDark ? 'dark' : 'light');
    
    // Écouter les changements de préférence système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Change le thème
   */
  setTheme(themeName: 'light' | 'dark'): void {
    const theme = themeName === 'dark' ? darkTheme : lightTheme;
    
    // Appliquer les variables CSS
    this.applyTheme(theme);
    
    // Mettre à jour les observables
    this.currentThemeSubject.next(theme);
    this.isDarkModeSubject.next(themeName === 'dark');
    
    // Sauvegarder la préférence
    localStorage.setItem(this.THEME_KEY, themeName);
    
    // Mettre à jour la classe du body pour Material Design
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${themeName}-theme`);
  }

  /**
   * Bascule entre thème clair et sombre
   */
  toggleTheme(): void {
    const currentTheme = this.currentThemeSubject.value;
    this.setTheme(currentTheme.name === 'light' ? 'dark' : 'light');
  }

  /**
   * Applique les variables CSS du thème
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    Object.entries(theme.properties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  /**
   * Obtient la couleur actuelle d'une variable CSS
   */
  getCSSVariable(variable: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }

  /**
   * Détermine si une couleur est claire ou sombre
   */
  isColorLight(color: string): boolean {
    // Convertir la couleur en RGB si nécessaire
    const rgb = this.hexToRgb(color) || this.getCSSVariable(color);
    
    if (!rgb) return false;
    
    // Calculer la luminance
    const matches = rgb.match(/\d+/g);
    if (!matches || matches.length < 3) return false;
    
    const [r, g, b] = matches.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5;
  }

  /**
   * Convertit une couleur hexadécimale en RGB
   */
  private hexToRgb(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : null;
  }

  /**
   * Génère une couleur avec opacity
   */
  withOpacity(colorVar: string, opacity: number): string {
    const color = this.getCSSVariable(colorVar);
    return `rgba(${color}, ${opacity})`;
  }

  /**
   * Retourne le thème actuel
   */
  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  /**
   * Vérifie si le mode sombre est actif
   */
  isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}