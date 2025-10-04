import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventRequest, UpdateEventRequest } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = 'http://localhost:5000/api/events';

  constructor(private http: HttpClient) {}

  /**
   * Obtenir les événements avec filtres optionnels
   */
  getEvents(params?: {
    dateDebut?: string;
    dateFin?: string;
    categorie?: string;
    visibilite?: string;
    page?: number;
    limit?: number;
  }): Observable<{
    evenements: Event[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<{
      evenements: Event[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(this.API_URL, { params: httpParams });
  }

  /**
   * Obtenir un événement par son ID
   */
  getEvent(id: string): Observable<{ evenement: Event }> {
    return this.http.get<{ evenement: Event }>(`${this.API_URL}/${id}`);
  }

  /**
   * Créer un nouvel événement
   */
  createEvent(eventData: CreateEventRequest): Observable<{ message: string; evenement: Event }> {
    return this.http.post<{ message: string; evenement: Event }>(this.API_URL, eventData);
  }

  /**
   * Mettre à jour un événement
   */
  updateEvent(id: string, eventData: UpdateEventRequest): Observable<{ message: string; evenement: Event }> {
    return this.http.put<{ message: string; evenement: Event }>(`${this.API_URL}/${id}`, eventData);
  }

  /**
   * Supprimer un événement
   */
  deleteEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }

  /**
   * Ajouter un commentaire à un événement
   */
  addComment(eventId: string, contenu: string): Observable<{ message: string; commentaires: any[] }> {
    return this.http.post<{ message: string; commentaires: any[] }>(
      `${this.API_URL}/${eventId}/commentaires`,
      { contenu }
    );
  }

  /**
   * Partager un événement avec d'autres utilisateurs
   */
  shareEvent(eventId: string, utilisateurs: string[]): Observable<{ message: string; participants: any[] }> {
    return this.http.post<{ message: string; participants: any[] }>(
      `${this.API_URL}/${eventId}/partager`,
      { utilisateurs }
    );
  }

  /**
   * Obtenir les événements pour une période donnée (pour le calendrier)
   */
  getEventsForPeriod(dateDebut: Date, dateFin: Date): Observable<{
    evenements: Event[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    return this.getEvents({
      dateDebut: dateDebut.toISOString(),
      dateFin: dateFin.toISOString(),
      limit: 1000 // Grande limite pour récupérer tous les événements de la période
    });
  }

  /**
   * Obtenir les événements du jour
   */
  getTodayEvents(): Observable<{
    evenements: Event[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.getEventsForPeriod(startOfDay, endOfDay);
  }

  /**
   * Obtenir les événements de la semaine
   */
  getWeekEvents(): Observable<{
    evenements: Event[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.getEventsForPeriod(startOfWeek, endOfWeek);
  }

  /**
   * Obtenir les événements du mois
   */
  getMonthEvents(year: number, month: number): Observable<{
    evenements: Event[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    return this.getEventsForPeriod(startOfMonth, endOfMonth);
  }

  /**
   * Rechercher des événements par titre ou description
   */
  searchEvents(query: string, page = 1, limit = 20): Observable<{
    evenements: Event[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{
      evenements: Event[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`${this.API_URL}/recherche`, { params });
  }
}