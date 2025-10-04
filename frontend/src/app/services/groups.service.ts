import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { 
  Group, 
  GroupInvitation, 
  GroupsResponse, 
  GroupDetailsResponse, 
  GroupInvitationsResponse,
  CreateGroupData,
  UpdateGroupData,
  InviteToGroupData,
  UpdateMemberRoleData 
} from '../models/social.model';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private readonly API_URL = 'http://localhost:5000/api/groups';
  
  private groupsSubject = new BehaviorSubject<Group[]>([]);
  public groups$ = this.groupsSubject.asObservable();
  
  private currentGroupSubject = new BehaviorSubject<Group | null>(null);
  public currentGroup$ = this.currentGroupSubject.asObservable();
  
  private groupInvitationsSubject = new BehaviorSubject<GroupInvitation[]>([]);
  public groupInvitations$ = this.groupInvitationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupérer la liste des groupes de l'utilisateur
   */
  getMyGroups(page: number = 1, limit: number = 20): Observable<GroupsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GroupsResponse>(`${this.API_URL}/my-groups`, { params })
      .pipe(
        tap(response => {
          if (page === 1) {
            this.groupsSubject.next(response.groups);
          } else {
            const currentGroups = this.groupsSubject.value;
            this.groupsSubject.next([...currentGroups, ...response.groups]);
          }
        })
      );
  }

  /**
   * Récupérer les détails d'un groupe
   */
  getGroupDetails(groupId: string): Observable<GroupDetailsResponse> {
    return this.http.get<GroupDetailsResponse>(`${this.API_URL}/${groupId}`)
      .pipe(
        tap(response => {
          this.currentGroupSubject.next(response.group);
        })
      );
  }

  /**
   * Créer un nouveau groupe
   */
  createGroup(data: CreateGroupData): Observable<{ message: string; group: Group }> {
    return this.http.post<{ message: string; group: Group }>(`${this.API_URL}`, data)
      .pipe(
        tap(response => {
          // Ajouter le nouveau groupe à la liste
          const currentGroups = this.groupsSubject.value;
          this.groupsSubject.next([response.group, ...currentGroups]);
        })
      );
  }

  /**
   * Mettre à jour un groupe
   */
  updateGroup(groupId: string, data: UpdateGroupData): Observable<{ message: string; group: Group }> {
    return this.http.put<{ message: string; group: Group }>(`${this.API_URL}/${groupId}`, data)
      .pipe(
        tap(response => {
          // Mettre à jour dans la liste
          const currentGroups = this.groupsSubject.value;
          const updatedGroups = currentGroups.map(group => 
            group._id === groupId ? response.group : group
          );
          this.groupsSubject.next(updatedGroups);
          
          // Mettre à jour le groupe actuel si c'est le même
          if (this.currentGroupSubject.value?._id === groupId) {
            this.currentGroupSubject.next(response.group);
          }
        })
      );
  }

  /**
   * Supprimer un groupe
   */
  deleteGroup(groupId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${groupId}`)
      .pipe(
        tap(() => {
          // Retirer de la liste
          const currentGroups = this.groupsSubject.value;
          const updatedGroups = currentGroups.filter(group => group._id !== groupId);
          this.groupsSubject.next(updatedGroups);
          
          // Nettoyer le groupe actuel si c'était le même
          if (this.currentGroupSubject.value?._id === groupId) {
            this.currentGroupSubject.next(null);
          }
        })
      );
  }

  /**
   * Inviter des utilisateurs à un groupe
   */
  inviteToGroup(data: InviteToGroupData): Observable<{ message: string; invitations: GroupInvitation[] }> {
    return this.http.post<{ message: string; invitations: GroupInvitation[] }>(`${this.API_URL}/invite`, data);
  }

  /**
   * Récupérer les invitations de groupe reçues
   */
  getGroupInvitations(): Observable<GroupInvitationsResponse> {
    return this.http.get<GroupInvitationsResponse>(`${this.API_URL}/invitations`)
      .pipe(
        tap(response => {
          this.groupInvitationsSubject.next(response.invitations);
        })
      );
  }

  /**
   * Répondre à une invitation de groupe
   */
  respondToGroupInvitation(invitationId: string, action: 'accept' | 'decline'): Observable<{ message: string; group?: Group }> {
    return this.http.post<{ message: string; group?: Group }>(`${this.API_URL}/invitations/${invitationId}/respond`, { action })
      .pipe(
        tap(response => {
          // Retirer l'invitation de la liste
          const currentInvitations = this.groupInvitationsSubject.value;
          const updatedInvitations = currentInvitations.filter(inv => inv._id !== invitationId);
          this.groupInvitationsSubject.next(updatedInvitations);

          // Si accepté, ajouter le groupe à la liste
          if (action === 'accept' && response.group) {
            const currentGroups = this.groupsSubject.value;
            this.groupsSubject.next([...currentGroups, response.group]);
          }
        })
      );
  }

  /**
   * Quitter un groupe
   */
  leaveGroup(groupId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/${groupId}/leave`, {})
      .pipe(
        tap(() => {
          // Retirer de la liste
          const currentGroups = this.groupsSubject.value;
          const updatedGroups = currentGroups.filter(group => group._id !== groupId);
          this.groupsSubject.next(updatedGroups);
          
          // Nettoyer le groupe actuel si c'était le même
          if (this.currentGroupSubject.value?._id === groupId) {
            this.currentGroupSubject.next(null);
          }
        })
      );
  }

  /**
   * Supprimer un membre du groupe
   */
  removeMember(groupId: string, userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${groupId}/members/${userId}`)
      .pipe(
        tap(() => {
          // Mettre à jour le groupe actuel si nécessaire
          const currentGroup = this.currentGroupSubject.value;
          if (currentGroup?._id === groupId) {
            const updatedMembers = currentGroup.members.filter(member => member.userId !== userId);
            this.currentGroupSubject.next({
              ...currentGroup,
              members: updatedMembers
            });
          }
        })
      );
  }

  /**
   * Changer le rôle d'un membre
   */
  updateMemberRole(groupId: string, data: UpdateMemberRoleData): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/${groupId}/members/${data.userId}/role`, data)
      .pipe(
        tap(() => {
          // Recharger les détails du groupe pour avoir les données à jour
          this.getGroupDetails(groupId).subscribe();
        })
      );
  }

  /**
   * Rechercher des groupes publics
   */
  searchPublicGroups(query: string, page: number = 1): Observable<GroupsResponse> {
    let params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', '10');

    return this.http.get<GroupsResponse>(`${this.API_URL}/search`, { params });
  }

  /**
   * Rejoindre un groupe public
   */
  joinPublicGroup(groupId: string): Observable<{ message: string; group: Group }> {
    return this.http.post<{ message: string; group: Group }>(`${this.API_URL}/${groupId}/join`, {})
      .pipe(
        tap(response => {
          // Ajouter le groupe à la liste
          const currentGroups = this.groupsSubject.value;
          this.groupsSubject.next([...currentGroups, response.group]);
        })
      );
  }

  /**
   * Obtenir les statistiques d'un groupe
   */
  getGroupStats(groupId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/${groupId}/stats`);
  }

  /**
   * Rafraîchir toutes les données de groupes
   */
  refreshGroupsData(): void {
    this.getMyGroups().subscribe();
    this.getGroupInvitations().subscribe();
  }

  /**
   * Nettoyer les données locales
   */
  clearGroupsData(): void {
    this.groupsSubject.next([]);
    this.currentGroupSubject.next(null);
    this.groupInvitationsSubject.next([]);
  }

  /**
   * Obtenir le nombre d'invitations en attente
   */
  getPendingInvitationsCount(): number {
    return this.groupInvitationsSubject.value.length;
  }

  /**
   * Vérifier si l'utilisateur est membre d'un groupe
   */
  isMemberOfGroup(groupId: string): boolean {
    const groups = this.groupsSubject.value;
    return groups.some(group => group._id === groupId);
  }

  /**
   * Obtenir le rôle de l'utilisateur dans un groupe
   */
  getUserRoleInGroup(groupId: string, userId: string): string | null {
    const groups = this.groupsSubject.value;
    const group = groups.find(g => g._id === groupId);
    if (!group) return null;
    
    const member = group.members.find(m => m.userId === userId);
    return member ? member.role : null;
  }
}