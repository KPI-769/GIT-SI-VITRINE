export type Role = 
  | 'MEMBER' 
  | 'CENSEUR' 
  | 'TREASURER' 
  | 'COMMUNITY_MANAGER'
  | 'LAB_MANAGER' 
  | 'ADMIN'
  | 'COMMUNICATION'
  | 'FORMATION'
  | 'CONSEILLER';

export const NIVEAUX = ['GI_1', 'GI_2', 'GI_3', 'GI_4', 'GI_5'] as const;
export type Niveau = typeof NIVEAUX[number] | 'GI_Bureau';

export interface MacAddress {
  id: string;
  address: string;
  deviceName?: string | null;
  userId: string;
}

export interface Cotisation {
  id: string;
  mois: number; // 1 to 12
  annee: number;
  montant: number;
  isPaid: boolean;
  userId: string;
  paymentId?: string | null;
  scannedBy?: string | null;
  createdAt?: string;
}

export interface Payment {
  id: string;
  montantTotal: number;
  method: string; // "Espèces", "Mobile Money", etc.
  reference?: string | null;
  treasurerId: string;
  createdAt: string;
  cotisationIds: string[];
}

export type PenaltyStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface Penalty {
  id: string;
  userId: string;
  censorId: string;
  reason: string;
  amount: number;
  status: PenaltyStatus;
  createdAt: string;
  paidAt?: string | null;
  isRefusal?: boolean;
  adminApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
}

export interface ProjectContributor {
  id: string;
  projectId: string;
  userId: string;
  roleInProject?: string;
  name?: string;
  matricule?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: 'Systèmes Embarqués' | 'Logiciel & Fullstack' | 'Réseaux & IoT' | 'Automatique & Robotique';
  githubUrl?: string;
  demoUrl?: string;
  coverImage?: string;
  featured?: boolean;
  technologies?: string[];
  membersCount?: number;
  contributors: ProjectContributor[];
}

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  status: EventStatus;
  coverImage?: string;
  registeredCount?: number;
}

export type CourseStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Course {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  instructor?: string;
  hoursCount?: number;
  startDate?: string;
  level: string; // "Tous Niveaux", "GI_3+", "GI_4 & GI_5"
}

export interface Certification {
  id: string;
  courseId: string;
  userId: string;
  courseTitle: string;
  issuedAt: string;
}

export interface User {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  phone?: string;
  niveau: string; // "GI_1", "GI_2", "GI_3", "GI_4", "GI_5"
  role: Role;
  poste?: string; // Ex: "Président", "Trésorière", "Censeur", "Responsable du Laboratoire"
  isActive: boolean;
  mustChangePassword?: boolean;
  password?: string;
  qrCodeToken?: string;
  isWifiAllowed?: boolean;
  isLabAllowed?: boolean;
  macAddresses: MacAddress[];
  cotisations: Cotisation[];
  penalties?: Penalty[];
  certifications?: Certification[];
  createdAt?: string;
  updatedAt?: string;
  passwordResetRequested?: boolean;
  passwordResetRequestedAt?: string;
  passwordResetReason?: string;
}

export interface ScanResult {
  allowed: boolean;
  user?: User;
  reason: string;
  timestamp: string;
  matricule?: string;
}

export interface AccessLog {
  id: string;
  matricule: string;
  nom?: string;
  prenom?: string;
  niveau?: string;
  granted: boolean;
  reason: string;
  scannedBy?: string;
  createdAt: string;
}

// Constantes de référence
export const CURRENT_MONTH = 10;
export const CURRENT_YEAR = 2026;
export const DEFAULT_COTISATION_AMOUNT = 2000; // 2000 FCFA

export const MONTH_NAMES: string[] = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export type GalleryCategory = 
  | 'EVENEMENT' 
  | 'HACKATHON' 
  | 'CONFERENCE' 
  | 'VIE_DU_CLUB' 
  | 'REMISE_PRIX' 
  | 'ASSEMBLEE';

export interface EventMediaItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  caption?: string;
  likes: number;
  uploadedAt: string;
}

export interface EventAlbum {
  id: string;
  title: string;
  description: string;
  category: GalleryCategory;
  date: string;
  location?: string;
  coverImage: string;
  uploadedBy: string;
  featured: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  media: EventMediaItem[];
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: GalleryCategory;
  date: string;
  uploadedBy: string;
  featured: boolean;
  status: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT';
  likes?: number;
  createdAt?: string;
}


