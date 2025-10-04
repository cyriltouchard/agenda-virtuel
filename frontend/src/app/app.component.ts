import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Agenda Virtuel';

  constructor(
    public authService: AuthService,
    private themeService: ThemeService
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    // Le service de thème s'initialise automatiquement
  }
}