import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  title = 'Agenda Virtuel';
  
  constructor(private router: Router) { }

  navigateToCalendar() {
    this.router.navigate(['/calendar']);
  }

  navigateToFriends() {
    this.router.navigate(['/friends']);
  }

  navigateToEvents() {
    this.router.navigate(['/events']);
  }
}