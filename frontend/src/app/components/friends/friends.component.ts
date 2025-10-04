import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { FriendsService } from '../../services/friends.service';
import { Friend, FriendRequest } from '../../models/social.model';
import { AddFriendDialogComponent } from './add-friend-dialog/add-friend-dialog.component';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  friends: Friend[] = [];
  friendRequests: { sent: FriendRequest[], received: FriendRequest[] } = { sent: [], received: [] };
  
  selectedTab = 0;
  searchQuery = '';
  isLoading = false;
  
  // Pagination
  currentPage = 1;
  hasMoreFriends = true;

  constructor(
    private friendsService: FriendsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFriendsData();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Observer les amis
    this.friendsService.friends$
      .pipe(takeUntil(this.destroy$))
      .subscribe(friends => {
        this.friends = friends;
      });

    // Observer les demandes d'amis
    this.friendsService.friendRequests$
      .pipe(takeUntil(this.destroy$))
      .subscribe(requests => {
        this.friendRequests = requests;
      });
  }

  private loadFriendsData(): void {
    this.isLoading = true;
    
    combineLatest([
      this.friendsService.getFriends(1, 20),
      this.friendsService.getFriendRequests()
    ]).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données d\'amis:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', { duration: 3000 });
      }
    });
  }

  /**
   * Rechercher des amis
   */
  searchFriends(): void {
    if (this.searchQuery.length >= 2) {
      this.isLoading = true;
      this.friendsService.getFriends(1, 20, this.searchQuery)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
    } else if (this.searchQuery === '') {
      this.loadFriendsData();
    }
  }

  /**
   * Charger plus d'amis (pagination)
   */
  loadMoreFriends(): void {
    if (this.hasMoreFriends && !this.isLoading) {
      this.currentPage++;
      this.isLoading = true;
      
      this.friendsService.getFriends(this.currentPage, 20, this.searchQuery)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.hasMoreFriends = response.friends.length === 20;
            this.isLoading = false;
          },
          error: () => {
            this.currentPage--;
            this.isLoading = false;
          }
        });
    }
  }

  /**
   * Ouvrir le dialogue pour ajouter un ami
   */
  openAddFriendDialog(): void {
    const dialogRef = this.dialog.open(AddFriendDialogComponent, {
      width: '500px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendFriendRequest(result);
      }
    });
  }

  /**
   * Envoyer une demande d'ami
   */
  private sendFriendRequest(data: { email: string, message?: string }): void {
    this.friendsService.sendFriendRequest({
      friendEmail: data.email,
      message: data.message
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Fermer', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Erreur lors de l\'envoi de l\'invitation', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Accepter une demande d'ami
   */
  acceptFriendRequest(requestId: string): void {
    this.friendsService.respondToFriendRequest({ requestId, action: 'accept' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Fermer', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Erreur lors de l\'acceptation', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  /**
   * Refuser une demande d'ami
   */
  declineFriendRequest(requestId: string): void {
    this.friendsService.respondToFriendRequest({ requestId, action: 'decline' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Fermer', { 
            duration: 3000,
            panelClass: ['info-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Erreur lors du refus', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  /**
   * Annuler une demande d'ami envoyée
   */
  cancelFriendRequest(requestId: string): void {
    this.friendsService.cancelFriendRequest(requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Fermer', { 
            duration: 3000,
            panelClass: ['info-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Erreur lors de l\'annulation', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  /**
   * Supprimer un ami
   */
  removeFriend(friend: Friend): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${friend.friend?.prenom} ${friend.friend?.nom} de vos amis ?`)) {
      this.friendsService.removeFriend(friend._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.snackBar.open(response.message, 'Fermer', { 
              duration: 3000,
              panelClass: ['info-snackbar']
            });
          },
          error: (error) => {
            this.snackBar.open(error.error?.message || 'Erreur lors de la suppression', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  /**
   * Obtenir les initiales d'un utilisateur
   */
  getUserInitials(user: any): string {
    if (!user) return '';
    const firstInitial = user.prenom?.charAt(0).toUpperCase() || '';
    const lastInitial = user.nom?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  }

  /**
   * Formater la date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Rafraîchir les données
   */
  refreshData(): void {
    this.currentPage = 1;
    this.hasMoreFriends = true;
    this.loadFriendsData();
  }

  /**
   * Changer d'onglet
   */
  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  /**
   * Obtenir le nombre de demandes reçues
   */
  getReceivedRequestsCount(): number {
    return this.friendRequests.received.length;
  }

  /**
   * Obtenir le nombre de demandes envoyées
   */
  getSentRequestsCount(): number {
    return this.friendRequests.sent.length;
  }
}