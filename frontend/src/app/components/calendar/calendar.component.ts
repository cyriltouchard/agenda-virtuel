import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventService } from '../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { Event, CalendarDay } from '../../models/event.model';
import { MatDialog } from '@angular/material/dialog';
import { EventFormComponent, EventFormData } from '../events/event-form/event-form.component';
import { Subject, takeUntil } from 'rxjs';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentDate = new Date();
  selectedDate: Date | null = null;
  calendarDays: CalendarDay[] = [];
  events: Event[] = [];
  isLoading = false;
  
  // Jours de la semaine
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Couleurs par catégorie
  categoryColors: { [key: string]: string } = {
    travail: '#3498db',
    personnel: '#2ecc71',
    etudes: '#9b59b6',
    sante: '#e74c3c',
    loisirs: '#f39c12',
    famille: '#e67e22',
    autre: '#95a5a6'
  };

  constructor(
    private eventService: EventService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.generateCalendar();
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Générer le calendrier pour le mois actuel
   */
  generateCalendar(): void {
    const monthStart = startOfMonth(this.currentDate);
    const monthEnd = endOfMonth(this.currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Commencer le lundi
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    this.calendarDays = [];
    let current = calendarStart;

    while (current <= calendarEnd) {
      this.calendarDays.push({
        date: new Date(current),
        isCurrentMonth: isSameMonth(current, this.currentDate),
        isToday: isToday(current),
        events: []
      });
      current = addDays(current, 1);
    }
  }

  /**
   * Charger les événements du mois
   */
  loadEvents(): void {
    this.isLoading = true;
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    this.eventService.getMonthEvents(year, month)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.events = response.evenements.map(event => ({
            ...event,
            dateDebut: typeof event.dateDebut === 'string' ? parseISO(event.dateDebut) : event.dateDebut,
            dateFin: typeof event.dateFin === 'string' ? parseISO(event.dateFin) : event.dateFin
          }));
          this.assignEventsToCalendarDays();
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.showError('Erreur lors du chargement des événements');
          this.isLoading = false;
        }
      });
  }

  /**
   * Assigner les événements aux jours du calendrier
   */
  assignEventsToCalendarDays(): void {
    this.calendarDays.forEach(day => {
      day.events = this.events.filter(event => {
        const eventStart = new Date(event.dateDebut);
        const eventEnd = new Date(event.dateFin);
        
        // Vérifier si l'événement se déroule ce jour
        return (
          isSameDay(eventStart, day.date) ||
          isSameDay(eventEnd, day.date) ||
          (eventStart <= day.date && eventEnd >= day.date)
        );
      });
    });
  }

  /**
   * Naviguer vers le mois précédent
   */
  previousMonth(): void {
    this.currentDate = subMonths(this.currentDate, 1);
    this.generateCalendar();
    this.loadEvents();
  }

  /**
   * Naviguer vers le mois suivant
   */
  nextMonth(): void {
    this.currentDate = addMonths(this.currentDate, 1);
    this.generateCalendar();
    this.loadEvents();
  }

  /**
   * Aller au mois actuel
   */
  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
    this.loadEvents();
  }

  /**
   * Sélectionner une date
   */
  selectDate(day: CalendarDay): void {
    this.selectedDate = day.date;
  }

  /**
   * Obtenir le titre du mois
   */
  getMonthTitle(): string {
    return format(this.currentDate, 'MMMM yyyy', { locale: fr });
  }

  /**
   * Obtenir le numéro du jour
   */
  getDayNumber(day: CalendarDay): string {
    return format(day.date, 'd');
  }

  /**
   * Vérifier si une date est sélectionnée
   */
  isDateSelected(day: CalendarDay): boolean {
    return this.selectedDate ? isSameDay(day.date, this.selectedDate) : false;
  }

  /**
   * Obtenir les classes CSS pour un jour
   */
  getDayClasses(day: CalendarDay): string[] {
    const classes = ['calendar-day'];
    
    if (!day.isCurrentMonth) classes.push('other-month');
    if (day.isToday) classes.push('today');
    if (this.isDateSelected(day)) classes.push('selected');
    if (day.events.length > 0) classes.push('has-events');
    
    return classes;
  }

  /**
   * Obtenir la couleur d'un événement
   */
  getEventColor(event: Event): string {
    return event.couleur || this.categoryColors[event.categorie] || this.categoryColors['autre'];
  }

  /**
   * Formater l'heure d'un événement
   */
  formatEventTime(event: Event): string {
    if (event.touteLaJournee) {
      return 'Toute la journée';
    }
    return format(new Date(event.dateDebut), 'HH:mm');
  }

  /**
   * Obtenir le titre court d'un événement
   */
  getEventTitle(event: Event): string {
    return event.titre.length > 20 ? event.titre.substring(0, 20) + '...' : event.titre;
  }

  /**
   * Ouvrir le détail d'un événement
   */
  openEventDetails(event: Event, $event: MouseEvent): void {
    $event.stopPropagation();
    
    const dialogData: EventFormData = {
      event: event,
      mode: 'edit'
    };

    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recharger les événements après modification
        this.loadEvents();
        this.notificationService.showSuccess('Événement modifié avec succès !');
      }
    });
  }

  /**
   * Créer un nouvel événement
   */
  createEvent(date?: Date): void {
    const eventDate = date || this.selectedDate || new Date();
    
    const dialogData: EventFormData = {
      selectedDate: eventDate,
      mode: 'create'
    };

    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recharger les événements après création
        this.loadEvents();
        this.notificationService.showSuccess('Événement créé avec succès !');
      }
    });
  }

  /**
   * Obtenir le nombre d'événements masqués
   */
  getHiddenEventsCount(day: CalendarDay): number {
    return Math.max(0, day.events.length - 3); // Afficher maximum 3 événements
  }

  /**
   * Obtenir les événements visibles (maximum 3)
   */
  getVisibleEvents(day: CalendarDay): Event[] {
    return day.events.slice(0, 3);
  }

  /**
   * Changer la vue (ajouté pour compatibilité future)
   */
  changeView(view: 'month' | 'week' | 'day'): void {
    // TODO: Implémenter les vues semaine et jour
    console.log('Changer vue:', view);
  }

  /**
   * Obtenir les événements du jour sélectionné
   */
  getDayEvents(): Event[] {
    if (!this.selectedDate) return [];
    
    const selectedDay = this.calendarDays.find(day => 
      isSameDay(day.date, this.selectedDate!)
    );
    
    return selectedDay ? selectedDay.events : [];
  }

  /**
   * Obtenir les clés des catégories pour la légende
   */
  getCategoryKeys(): string[] {
    return Object.keys(this.categoryColors);
  }
}