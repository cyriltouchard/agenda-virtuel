export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  bio?: string;
  parametresVisibilite: {
    profil: 'public' | 'amis' | 'prive';
    agenda: 'public' | 'amis' | 'prive';
  };
  amis?: string[];
  dernierConnexion?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  utilisateur: User;
}

export interface DemandeAmi {
  _id: string;
  de: User;
  dateDemande: Date;
}

export interface Notification {
  _id: string;
  type: 'ami_demande' | 'ami_accepte' | 'evenement_partage' | 'commentaire';
  message: string;
  de?: User;
  lu: boolean;
  dateCreation: Date;
}