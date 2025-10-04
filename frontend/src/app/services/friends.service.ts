import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { 
  Friend, 
  FriendRequest, 
  FriendsResponse, 
  FriendRequestsResponse, 
  SendFriendRequestData,
  RespondToFriendRequestData 
} from '../models/social.model';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private readonly API_URL = 'http://localhost:5000/api/friends';
  
  private friendsSubject = new BehaviorSubject<Friend[]>([]);
  public friends$ = this.friendsSubject.asObservable();
  
  private friendRequestsSubject = new BehaviorSubject<{sent: FriendRequest[], received: FriendRequest[]}>({
    sent: [],
    received: []
  });
  public friendRequests$ = this.friendRequestsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupérer la liste des amis
   */
  getFriends(page: number = 1, limit: number = 20, search?: string): Observable<FriendsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<FriendsResponse>(`${this.API_URL}`, { params })
      .pipe(
        tap(response => {
          if (page === 1) {
            this.friendsSubject.next(response.friends);
          } else {
            const currentFriends = this.friendsSubject.value;
            this.friendsSubject.next([...currentFriends, ...response.friends]);
          }
        })
      );
  }

  /**
   * Récupérer les demandes d'amis (envoyées et reçues)
   */
  getFriendRequests(): Observable<FriendRequestsResponse> {
    return this.http.get<FriendRequestsResponse>(`${this.API_URL}/requests`)
      .pipe(
        tap(response => {
          this.friendRequestsSubject.next({
            sent: response.sent,
            received: response.received
          });
        })
      );
  }

  /**
   * Envoyer une demande d'ami
   */
  sendFriendRequest(data: SendFriendRequestData): Observable<{ message: string; request: FriendRequest }> {
    return this.http.post<{ message: string; request: FriendRequest }>(`${this.API_URL}/request`, data)
      .pipe(
        tap(response => {
          // Mettre à jour les demandes envoyées
          const current = this.friendRequestsSubject.value;
          this.friendRequestsSubject.next({
            ...current,
            sent: [...current.sent, response.request]
          });
        })
      );
  }

  /**
   * Répondre à une demande d'ami
   */
  respondToFriendRequest(data: RespondToFriendRequestData): Observable<{ message: string; friend?: Friend }> {
    return this.http.post<{ message: string; friend?: Friend }>(`${this.API_URL}/respond`, data)
      .pipe(
        tap(response => {
          // Retirer la demande de la liste des demandes reçues
          const current = this.friendRequestsSubject.value;
          const updatedReceived = current.received.filter(req => req._id !== data.requestId);
          
          this.friendRequestsSubject.next({
            ...current,
            received: updatedReceived
          });

          // Si accepté, ajouter à la liste des amis
          if (data.action === 'accept' && response.friend) {
            const currentFriends = this.friendsSubject.value;
            this.friendsSubject.next([...currentFriends, response.friend]);
          }
        })
      );
  }

  /**
   * Annuler une demande d'ami envoyée
   */
  cancelFriendRequest(requestId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/request/${requestId}`)
      .pipe(
        tap(() => {
          // Retirer de la liste des demandes envoyées
          const current = this.friendRequestsSubject.value;
          const updatedSent = current.sent.filter(req => req._id !== requestId);
          
          this.friendRequestsSubject.next({
            ...current,
            sent: updatedSent
          });
        })
      );
  }

  /**
   * Supprimer un ami
   */
  removeFriend(friendId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${friendId}`)
      .pipe(
        tap(() => {
          // Retirer de la liste des amis
          const currentFriends = this.friendsSubject.value;
          const updatedFriends = currentFriends.filter(friend => friend._id !== friendId);
          this.friendsSubject.next(updatedFriends);
        })
      );
  }

  /**
   * Bloquer un utilisateur
   */
  blockUser(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/block`, { userId });
  }

  /**
   * Débloquer un utilisateur
   */
  unblockUser(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/unblock`, { userId });
  }

  /**
   * Rechercher des utilisateurs pour les ajouter en ami
   */
  searchUsers(query: string): Observable<{ users: any[] }> {
    return this.http.get<{ users: any[] }>(`${this.API_URL}/search`, {
      params: { q: query }
    });
  }

  /**
   * Vérifier le statut d'amitié avec un utilisateur
   */
  getFriendshipStatus(userId: string): Observable<{ status: string; canSendRequest: boolean }> {
    return this.http.get<{ status: string; canSendRequest: boolean }>(`${this.API_URL}/status/${userId}`);
  }

  /**
   * Obtenir les amis en ligne
   */
  getOnlineFriends(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.API_URL}/online`);
  }

  /**
   * Rafraîchir toutes les données d'amis
   */
  refreshFriendsData(): void {
    this.getFriends().subscribe();
    this.getFriendRequests().subscribe();
  }

  /**
   * Nettoyer les données locales
   */
  clearFriendsData(): void {
    this.friendsSubject.next([]);
    this.friendRequestsSubject.next({ sent: [], received: [] });
  }

  /**
   * Obtenir le nombre de demandes d'amis en attente
   */
  getPendingRequestsCount(): number {
    return this.friendRequestsSubject.value.received.length;
  }

  /**
   * Vérifier si un utilisateur est ami
   */
  isFriend(userId: string): boolean {
    const friends = this.friendsSubject.value;
    return friends.some(friend => friend.friendId === userId || friend.userId === userId);
  }
}