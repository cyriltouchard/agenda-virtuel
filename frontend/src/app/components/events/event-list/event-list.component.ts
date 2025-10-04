import { Component } from '@angular/core';

@Component({
  selector: 'app-event-list',
  template: `
    <div class="events-container">
      <h1>Mes Événements</h1>
      <mat-card>
        <mat-card-content>
          <p>Liste des événements - À implémenter</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .events-container {
      padding: 2rem;
    }
  `]
})
export class EventListComponent {}