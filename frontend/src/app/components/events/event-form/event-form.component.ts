import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { EventService } from '../../../services/event.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { Event, CreateEventRequest, UpdateEventRequest } from '../../../models/event.model';
import { User } from '../../../models/user.model';

export interface EventFormData {
  event?: Event;
  selectedDate?: Date;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  eventForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  
  // Options pour les sélecteurs
  categories = [
    { value: 'travail', label: 'Travail', icon: 'work', color: '#3498db' },
    { value: 'personnel', label: 'Personnel', icon: 'person', color: '#2ecc71' },
    { value: 'etudes', label: 'Études', icon: 'school', color: '#9b59b6' },
    { value: 'sante', label: 'Santé', icon: 'local_hospital', color: '#e74c3c' },
    { value: 'loisirs', label: 'Loisirs', icon: 'sports_esports', color: '#f39c12' },
    { value: 'famille', label: 'Famille', icon: 'family_restroom', color: '#e67e22' },
    { value: 'autre', label: 'Autre', icon: 'category', color: '#95a5a6' }
  ];
  
  visibiliteOptions = [
    { value: 'prive', label: 'Privé', icon: 'lock', description: 'Visible uniquement par vous' },
    { value: 'amis', label: 'Amis', icon: 'group', description: 'Visible par vos amis uniquement' },
    { value: 'public', label: 'Public', icon: 'public', description: 'Visible par tout le monde' }
  ];
  
  rappelOptions = [
    { value: 0, label: 'Au moment de l\'événement' },
    { value: 15, label: '15 minutes avant' },
    { value: 30, label: '30 minutes avant' },
    { value: 60, label: '1 heure avant' },
    { value: 1440, label: '1 jour avant' },
    { value: 10080, label: '1 semaine avant' }
  ];
  
  typeRappelOptions = [
    { value: 'notification', label: 'Notification', icon: 'notifications' },
    { value: 'email', label: 'Email', icon: 'email' },
    { value: 'popup', label: 'Pop-up', icon: 'popup' }
  ];
  
  couleursPredefinies = [
    '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', 
    '#f39c12', '#e67e22', '#95a5a6', '#1abc9c',
    '#34495e', '#f1c40f', '#e91e63', '#9c27b0'
  ];
  
  utilisateurs: User[] = [];
  amis: User[] = [];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private userService: UserService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<EventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventFormData
  ) {
    this.isEditMode = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();
    
    if (this.isEditMode && this.data.event) {
      this.populateForm(this.data.event);
    } else if (this.data.selectedDate) {
      this.setDefaultDate(this.data.selectedDate);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser le formulaire avec tous les champs
   */
  initializeForm(): void {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    this.eventForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      dateDebut: [now, Validators.required],
      dateFin: [oneHourLater, Validators.required],
      heureDebut: ['09:00'],
      heureFin: ['10:00'],
      touteLaJournee: [false],
      lieu: ['', Validators.maxLength(200)],
      categorie: ['personnel', Validators.required],
      couleur: ['#3498db'],
      visibilite: ['prive', Validators.required],
      rappels: this.fb.array([]),
      tags: this.fb.array([]),
      participants: this.fb.array([]),
      liens: this.fb.array([])
    });

    // Écouter les changements de "toute la journée"
    this.eventForm.get('touteLaJournee')?.valueChanges.subscribe(touteLaJournee => {
      this.handleTouteLaJourneeChange(touteLaJournee);
    });

    // Validation des dates
    this.eventForm.get('dateDebut')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
    
    this.eventForm.get('dateFin')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
  }

  /**
   * Charger la liste des utilisateurs et amis
   */
  loadUsers(): void {
    this.userService.getFriends()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (amis) => {
          this.amis = amis;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des amis:', error);
        }
      });
  }

  /**
   * Remplir le formulaire avec les données d'un événement existant
   */
  populateForm(event: Event): void {
    this.eventForm.patchValue({
      titre: event.titre,
      description: event.description,
      dateDebut: new Date(event.dateDebut),
      dateFin: new Date(event.dateFin),
      touteLaJournee: event.touteLaJournee,
      lieu: event.lieu,
      categorie: event.categorie,
      couleur: event.couleur,
      visibilite: event.visibilite
    });

    // Ajouter les rappels
    if (event.rappels) {
      event.rappels.forEach(rappel => {
        this.ajouterRappel(rappel.tempsDAvance, rappel.type);
      });
    }

    // Ajouter les tags
    if (event.tags) {
      event.tags.forEach(tag => {
        this.ajouterTag(tag);
      });
    }

    // Ajouter les liens
    if (event.liens) {
      event.liens.forEach(lien => {
        this.ajouterLien(lien.titre, lien.url, lien.description);
      });
    }
  }

  /**
   * Définir la date par défaut
   */
  setDefaultDate(date: Date): void {
    const startDate = new Date(date);
    startDate.setHours(9, 0, 0, 0); // 9h00 par défaut
    
    const endDate = new Date(date);
    endDate.setHours(10, 0, 0, 0); // 10h00 par défaut

    this.eventForm.patchValue({
      dateDebut: startDate,
      dateFin: endDate
    });
  }

  /**
   * Gérer le changement "toute la journée"
   */
  handleTouteLaJourneeChange(touteLaJournee: boolean): void {
    const dateDebut = this.eventForm.get('dateDebut')?.value;
    const dateFin = this.eventForm.get('dateFin')?.value;

    if (touteLaJournee) {
      // Définir à minuit pour toute la journée
      const startOfDay = new Date(dateDebut);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateFin);
      endOfDay.setHours(23, 59, 59, 999);

      this.eventForm.patchValue({
        dateDebut: startOfDay,
        dateFin: endOfDay
      });
    }
  }

  /**
   * Valider que la date de fin est après la date de début
   */
  validateDates(): void {
    const dateDebut = this.eventForm.get('dateDebut')?.value;
    const dateFin = this.eventForm.get('dateFin')?.value;

    if (dateDebut && dateFin && dateDebut >= dateFin) {
      this.eventForm.get('dateFin')?.setErrors({ 'dateInvalide': true });
    } else {
      const errors = this.eventForm.get('dateFin')?.errors;
      if (errors) {
        delete errors['dateInvalide'];
        if (Object.keys(errors).length === 0) {
          this.eventForm.get('dateFin')?.setErrors(null);
        }
      }
    }
  }

  // Getters pour les FormArrays
  get rappels(): FormArray {
    return this.eventForm.get('rappels') as FormArray;
  }

  get tags(): FormArray {
    return this.eventForm.get('tags') as FormArray;
  }

  get participants(): FormArray {
    return this.eventForm.get('participants') as FormArray;
  }

  get liens(): FormArray {
    return this.eventForm.get('liens') as FormArray;
  }

  /**
   * Ajouter un rappel
   */
  ajouterRappel(tempsDAvance: number = 15, type: string = 'notification'): void {
    const rappelGroup = this.fb.group({
      tempsDAvance: [tempsDAvance, [Validators.required, Validators.min(0)]],
      type: [type, Validators.required]
    });
    
    this.rappels.push(rappelGroup);
  }

  /**
   * Supprimer un rappel
   */
  supprimerRappel(index: number): void {
    this.rappels.removeAt(index);
  }

  /**
   * Ajouter un tag
   */
  ajouterTag(valeur: string = ''): void {
    if (valeur.trim()) {
      const tagControl = this.fb.control(valeur.trim(), [Validators.required, Validators.maxLength(20)]);
      this.tags.push(tagControl);
    }
  }

  /**
   * Supprimer un tag
   */
  supprimerTag(index: number): void {
    this.tags.removeAt(index);
  }

  /**
   * Ajouter un lien
   */
  ajouterLien(titre: string = '', url: string = '', description: string = ''): void {
    const lienGroup = this.fb.group({
      titre: [titre, [Validators.required, Validators.maxLength(50)]],
      url: [url, [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      description: [description, Validators.maxLength(200)]
    });
    
    this.liens.push(lienGroup);
  }

  /**
   * Supprimer un lien
   */
  supprimerLien(index: number): void {
    this.liens.removeAt(index);
  }

  /**
   * Sélectionner une couleur
   */
  selectionnerCouleur(couleur: string): void {
    this.eventForm.patchValue({ couleur });
  }

  /**
   * Obtenir l'icône d'une catégorie
   */
  getCategorieIcon(categorie: string): string {
    const cat = this.categories.find(c => c.value === categorie);
    return cat ? cat.icon : 'category';
  }

  /**
   * Obtenir la couleur d'une catégorie
   */
  getCategorieColor(categorie: string): string {
    const cat = this.categories.find(c => c.value === categorie);
    return cat ? cat.color : '#95a5a6';
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.eventForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const formValue = this.eventForm.value;
      const eventData = this.prepareEventData(formValue);

      const operation = this.isEditMode 
        ? this.eventService.updateEvent(this.data.event!._id, eventData as UpdateEventRequest)
        : this.eventService.createEvent(eventData as CreateEventRequest);

      operation
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            const message = this.isEditMode 
              ? 'Événement modifié avec succès' 
              : 'Événement créé avec succès';
            
            this.notificationService.showSuccess(message);
            this.dialogRef.close(response.evenement);
          },
          error: (error) => {
            this.isLoading = false;
            const message = error.error?.error || 'Erreur lors de la sauvegarde';
            this.notificationService.showError(message);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Préparer les données pour l'envoi
   */
  private prepareEventData(formValue: any): CreateEventRequest | UpdateEventRequest {
    // Combiner date et heure pour dateDebut et dateFin
    let dateDebut = new Date(formValue.dateDebut);
    let dateFin = new Date(formValue.dateFin);
    
    if (!formValue.touteLaJournee && formValue.heureDebut) {
      const [heures, minutes] = formValue.heureDebut.split(':');
      dateDebut.setHours(parseInt(heures), parseInt(minutes), 0, 0);
    }
    
    if (!formValue.touteLaJournee && formValue.heureFin) {
      const [heures, minutes] = formValue.heureFin.split(':');
      dateFin.setHours(parseInt(heures), parseInt(minutes), 0, 0);
    }

    return {
      titre: formValue.titre,
      description: formValue.description,
      dateDebut: dateDebut,
      dateFin: dateFin,
      touteLaJournee: formValue.touteLaJournee,
      lieu: formValue.lieu,
      categorie: formValue.categorie,
      couleur: formValue.couleur,
      visibilite: formValue.visibilite,
      rappels: formValue.rappels,
      tags: formValue.tags.map((tag: any) => typeof tag === 'string' ? tag : tag.value)
    };
  }

  /**
   * Marquer tous les champs comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      this.eventForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Annuler et fermer
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}