export interface Event {
  _id: string;
  titre: string;
  description?: string;
  dateDebut: Date;
  dateFin: Date;
  touteLaJournee: boolean;
  lieu?: string;
  categorie: 'travail' | 'personnel' | 'etudes' | 'sante' | 'loisirs' | 'famille' | 'autre';
  couleur: string;
  visibilite: 'public' | 'amis' | 'prive';
  proprietaire: string | User;
  participants?: Participant[];
  rappels?: Rappel[];
  fichiers?: Fichier[];
  liens?: Lien[];
  commentaires?: Commentaire[];
  tags?: string[];
  recurrence?: Recurrence;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Participant {
  utilisateur: string | User;
  statut: 'invite' | 'accepte' | 'decline' | 'tentative';
  dateReponse?: Date;
}

export interface Rappel {
  type: 'email' | 'notification' | 'popup';
  tempsDAvance: number; // en minutes
}

export interface Fichier {
  nom: string;
  url: string;
  type: string;
  taille: number;
  dateUpload: Date;
}

export interface Lien {
  titre: string;
  url: string;
  description?: string;
}

export interface Commentaire {
  _id: string;
  auteur: string | User;
  contenu: string;
  dateCreation: Date;
}

export interface Recurrence {
  type: 'aucune' | 'quotidien' | 'hebdomadaire' | 'mensuel' | 'annuel';
  intervalle: number;
  joursSemaine?: number[];
  jourMois?: number;
  dateFin?: Date;
}

export interface CreateEventRequest {
  titre: string;
  description?: string;
  dateDebut: Date;
  dateFin: Date;
  touteLaJournee?: boolean;
  lieu?: string;
  categorie?: 'travail' | 'personnel' | 'etudes' | 'sante' | 'loisirs' | 'famille' | 'autre';
  couleur?: string;
  visibilite?: 'public' | 'amis' | 'prive';
  rappels?: Rappel[];
  tags?: string[];
}

export interface UpdateEventRequest {
  titre?: string;
  description?: string;
  dateDebut?: Date;
  dateFin?: Date;
  touteLaJournee?: boolean;
  lieu?: string;
  categorie?: 'travail' | 'personnel' | 'etudes' | 'sante' | 'loisirs' | 'famille' | 'autre';
  couleur?: string;
  visibilite?: 'public' | 'amis' | 'prive';
  rappels?: Rappel[];
  tags?: string[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

// Import User interface
import { User } from './user.model';