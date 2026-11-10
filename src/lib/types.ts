export type Role = 
  | 'MEMBER' 
  | 'CENSEUR' 
  | 'TREASURER' 
  | 'COMMUNITY_MANAGER'
  | 'LAB_MANAGER' 
  | 'ADMIN'
  | 'COMMUNICATION'
  | 'FORMATION'
  | 'CONSEILLER'
  | 'COMMISSAIRE_AUX_COMPTES';

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
  linkedinUrl?: string;
  tiktokUrl?: string;
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
  registrations?: string[]; // IDs des membres inscrits
}

export type BroadcastStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export interface Broadcast {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  endedAt?: string;
  platform: 'YouTube' | 'TikTok' | 'Instagram' | 'Autre';
  streamUrl?: string;
  status: BroadcastStatus;
  coverImage?: string;
  registrations?: string[]; // IDs des membres ayant demandé à participer
  createdAt: string;
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
  enrollments?: string[]; // IDs des membres inscrits (pour les formations futures/planifiées)
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
export const COTISATION_AMOUNT_MEMBER = 1000; // 1 000 FCFA pour les membres
export const COTISATION_AMOUNT_BUREAU = 1500; // 1 500 FCFA pour les membres du bureau
export const DEFAULT_COTISATION_AMOUNT = 1000; // Rétro-compatibilité

export function getCotisationAmountForUser(user?: { role?: string; niveau?: string } | null): number {
  if (!user) return COTISATION_AMOUNT_MEMBER;
  const isBureau = user.role !== 'MEMBER' || user.niveau === 'GI_Bureau';
  return isBureau ? COTISATION_AMOUNT_BUREAU : COTISATION_AMOUNT_MEMBER;
}

export interface Decaissement {
  id: string;
  memberId: string;
  memberName: string;
  memberMatricule: string;
  amount: number;
  motif: string;
  beneficiaireCategory: 'MEMBRE' | 'FOURNISSEUR' | 'PROJET_LABO' | 'EVENEMENT';
  certifiedByCommissaireId: string;
  certifiedByCommissaireName: string;
  reference: string;
  timestamp: string;
  scanVerified: boolean;
}

export type AuditActionType =
  | 'COTISATION_ENCAISSEE'
  | 'PENALITE_PAYEE'
  | 'PENALITE_ENREGISTREE'
  | 'DECAISSEMENT_SCAN_CERTIFIE'
  | 'MOT_DE_PASSE_REINITIALISE'
  | 'AUTORISATION_PERIPHERIQUE'
  | 'ROLE_MODIFIE'
  | 'ACCES_LABO_SCAN';

export interface AuditLogItem {
  id: string;
  action: AuditActionType;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetId?: string;
  targetName?: string;
  targetMatricule?: string;
  amount?: number;
  details: string;
  timestamp: string;
}

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


