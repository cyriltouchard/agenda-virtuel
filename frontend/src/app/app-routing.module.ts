import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EventListComponent } from './components/events/event-list/event-list.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { FriendsComponent } from './components/friends/friends.component';

const routes: Routes = [
  // Route par défaut - redirection
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Routes publiques (non authentifiées)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Routes protégées (authentifiées)
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'calendar', 
    component: CalendarComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'events', 
    component: EventListComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'friends', 
    component: FriendsComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'notifications', 
    component: NotificationsComponent, 
    canActivate: [AuthGuard] 
  },
  
  // Route wildcard - page non trouvée
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }