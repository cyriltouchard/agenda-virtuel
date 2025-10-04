import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, DemandeAmi, Notification } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Rechercher des utilisateurs
   */
  searchUsers(query: string, page = 1, limit = 10): Observable<{
    utilisateurs: User[];
    pagination: { page: number; limit: number; total: number };
  }> {
    return this.http.get<{
      utilisateurs: User[];
      pagination: { page: number; limit: number; total: number };
    }>(`${this.API_URL}/rechercher`, {
      params: { q: query, page: page.toString(), limit: limit.toString() }
    });
  }

  /**
   * Obtenir le profil d'un utilisateur
   */
  getUserProfile(userId: string): Observable<{ utilisateur: User }> {
    return this.http.get<{ utilisateur: User }>(`${this.API_URL}/${userId}`);
  }

  /**
   * Envoyer une demande d'ami
   */
  sendFriendRequest(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/${userId}/demande-ami`, {});
  }

  /**
   * Répondre à une demande d'ami
   */
  respondToFriendRequest(requestId: string, accept: boolean): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/demandes-amis/${requestId}/repondre`, {
      accepter: accept
    });
  }

  /**
   * Obtenir les demandes d'amis en attente
   */
  getFriendRequests(): Observable<{ demandesAmis: DemandeAmi[] }> {
    return this.http.get<{ demandesAmis: DemandeAmi[] }>(`${this.API_URL}/demandes-amis`);
  }

  /**
   * Supprimer un ami
   */
  removeFriend(friendId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/amis/${friendId}`);
  }

  /**
   * Obtenir la liste des amis
   */
  getFriends(): Observable<User[]> {
    return this.http.get<{ amis: User[] }>(`${this.API_URL}/amis`)
      .pipe(
        map(response => response.amis)
      );
  }

  /**
   * Obtenir les notifications
   */
  getNotifications(page = 1, limit = 20, unreadOnly = false): Observable<{
    notifications: Notification[];
    pagination: { page: number; limit: number; total: number; nonLues: number };
  }> {
    return this.http.get<{
      notifications: Notification[];
      pagination: { page: number; limit: number; total: number; nonLues: number };
    }>(`${this.API_URL}/notifications`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        nonLues: unreadOnly.toString()
      }
    });
  }

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead(notificationId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.API_URL}/notifications/${notificationId}/marquer-lu`,
      {}
    );
  }
}