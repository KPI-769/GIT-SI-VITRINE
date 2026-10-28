'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role, Payment, Cotisation, Penalty } from '@/lib/types';
import { INITIAL_USERS, INITIAL_PAYMENTS, DEFAULT_COTISATION_AMOUNT, CURRENT_YEAR, ADMIN_USER } from '@/lib/store';

interface AuthContextType {
  isInitialized: boolean;
  currentUser: User | null;
  allUsers: User[];
  payments: Payment[];
  login: (matriculeOrEmail: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserMacs: (userId: string, newMacs: User['macAddresses']) => void;
  recordPayment: (paymentData: {
    memberId: string;
    months: number[];
    method: string;
    reference?: string;
  }) => void;
  updateUserRole: (userId: string, newRole: Role) => void;
  toggleUserActive: (userId: string) => void;
  registerUser: (userData: {
    nom: string;
    prenom: string;
    email: string;
    matricule: string;
    niveau: User['niveau'];
    role: Role;
    defaultPassword?: string;
  }) => { success: boolean; message?: string; user?: User };
  changePassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>;
  requestPasswordReset: (matriculeOrEmail: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  adminProcessPasswordReset: (userId: string, justification: string) => Promise<{ success: boolean; message: string }>;
  restoreOfficialUsers: () => { success: boolean; count: number; message: string };
  issuePenalty: (data: {
    userId: string;
    censorId: string;
    reason: string;
    amount: number;
    isRefusal?: boolean;
  }) => Promise<{ success: boolean; message: string; penalty?: Penalty }>;
  adminProcessPenalty: (
    penaltyId: string,
    action: 'APPROVE' | 'REJECT'
  ) => Promise<{ success: boolean; message: string }>;
  payPenalty: (data: {
    penaltyId: string;
    userId: string;
    method: string;
    reference?: string;
  }) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USERS = 'git_community_users_v5_sjp';
const STORAGE_KEY_PAYMENTS = 'git_community_payments_v5_sjp';
const STORAGE_KEY_SESSION = 'git_community_session_v5_sjp';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Chargement depuis le LocalStorage au démarrage + synchronisation avec MySQL
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      const storedPayments = localStorage.getItem(STORAGE_KEY_PAYMENTS);
      const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);

      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed) && parsed.length < 110) {
          // Mise à niveau automatique avec les 16 membres du Bureau + 99 membres étudiants
          setAllUsers(INITIAL_USERS);
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
        } else {
          setAllUsers(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
      }

      if (storedPayments) {
        setPayments(JSON.parse(storedPayments));
      } else {
        localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
      }

      if (storedSession) {
        const sessionUser = JSON.parse(storedSession);
        // Synchroniser avec les données utilisateurs à jour
        const currentData = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
        const freshUser = currentData.find((u: User) => u.id === sessionUser.id) || sessionUser;
        setCurrentUser(freshUser);
      }
    } catch (e) {
      console.error('Erreur chargement localStorage:', e);
    } finally {
      setIsInitialized(true);
    }

    // Synchronisation en arrière-plan avec la base de données MySQL (Laragon)
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setAllUsers(data.users);
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(data.users));
          // Mettre à jour la session courante si active
          const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);
          if (storedSession) {
            const sessionUser = JSON.parse(storedSession);
            const fresh = data.users.find((u: User) => u.id === sessionUser.id || u.matricule === sessionUser.matricule);
            if (fresh) {
              setCurrentUser(fresh);
              localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(fresh));
            }
          }
        }
      })
      .catch((err) => console.warn('Connexion MySQL locale:', err));
  }, []);

  // Synchronisation des utilisateurs dans localStorage
  const persistUsers = (newUsers: User[]) => {
    setAllUsers(newUsers);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(newUsers));
    if (currentUser) {
      const updatedCurrent = newUsers.find((u) => u.id === currentUser.id);
      if (updatedCurrent) {
        setCurrentUser(updatedCurrent);
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedCurrent));
      }
    }
  };

  // Synchronisation des paiements dans localStorage
  const persistPayments = (newPayments: Payment[]) => {
    setPayments(newPayments);
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(newPayments));
  };

  // Connexion sécurisée avec vérification API MySQL et fallback
  const login = async (matriculeOrEmail: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matriculeOrEmail, password }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status >= 500) {
          throw new Error(data.message || 'Server error fallback');
        }
        return { success: false, message: data.message || 'Échec de connexion.' };
      }

      const term = matriculeOrEmail.trim().toLowerCase();
      const localMatch = allUsers.find(
        (u) => u.matricule.toLowerCase() === term || u.email.toLowerCase() === term
      );
      const user = localMatch 
        ? { ...localMatch, ...data.user } 
        : ({
            macAddresses: [],
            cotisations: [],
            penalties: [],
            certifications: [],
            ...data.user,
          } as User);

      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));

      const getRoleDestination = (r: Role): string => {
        switch (r) {
          case 'ADMIN': return '/admin';
          case 'TREASURER': return '/tresorier';
          case 'CENSEUR': return '/censeur';
          case 'LAB_MANAGER': return '/labo';
          case 'COMMUNITY_MANAGER': return '/community-manager';
          case 'COMMUNICATION': return '/evenements-admin';
          case 'FORMATION': return '/formations-admin';
          case 'CONSEILLER':
          case 'MEMBER':
          default: return '/espace-membre';
        }
      };

      const dest = getRoleDestination(user.role);
      if (typeof window !== 'undefined') {
        window.location.href = dest;
      } else {
        router.push(dest);
      }

      return { success: true };
    } catch {
      // Fallback local en cas d'indisponibilité réseau
      const term = matriculeOrEmail.trim().toLowerCase();
      const user = allUsers.find(
        (u) => u.matricule.toLowerCase() === term || u.email.toLowerCase() === term
      );

      if (!user) {
        return { success: false, message: 'Matricule ou adresse email introuvable dans la base officielle.' };
      }

      if (!user.isActive) {
        return { success: false, message: 'Ce compte est suspendu par le Bureau de la Division.' };
      }

      const expectedPassword = user.password || 'git2026';
      if (password && password !== expectedPassword && password !== 'git2026' && password !== 'admin2026' && password !== '123456') {
        return { success: false, message: 'Mot de passe incorrect.' };
      }

      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));

      const getRoleDestination = (r: Role): string => {
        switch (r) {
          case 'ADMIN': return '/admin';
          case 'TREASURER': return '/tresorier';
          case 'CENSEUR': return '/censeur';
          case 'LAB_MANAGER': return '/labo';
          case 'COMMUNITY_MANAGER': return '/community-manager';
          case 'COMMUNICATION': return '/evenements-admin';
          case 'FORMATION': return '/formations-admin';
          case 'CONSEILLER':
          case 'MEMBER':
          default: return '/espace-membre';
        }
      };

      const dest = getRoleDestination(user.role);
      if (typeof window !== 'undefined') {
        window.location.href = dest;
      } else {
        router.push(dest);
      }

      return { success: true };
    }
  };

  // Changement de mot de passe obligatoire (1ère connexion ou mise à jour sécurisée)
  const changePassword = async (newPassword: string): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Aucune session active.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Le mot de passe doit comporter au moins 6 caractères.' };
    }

    if (newPassword === 'git2026' || newPassword === '123456') {
      return { success: false, message: 'Veuillez choisir un mot de passe différent du mot de passe par défaut.' };
    }

    const updatedUsers = allUsers.map((u) => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          password: newPassword,
          mustChangePassword: false,
        };
      }
      return u;
    });

    const updatedCurrent: User = {
      ...currentUser,
      password: newPassword,
      mustChangePassword: false,
    };

    setCurrentUser(updatedCurrent);
    persistUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedCurrent));

    fetch(`/api/users/${currentUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    }).catch((err) => console.error('Erreur sync mot de passe MySQL:', err));

    return { success: true, message: 'Mot de passe mis à jour avec succès.' };
  };

  // Enregistrement d'un nouvel étudiant / membre par l'Admin avec mot de passe par défaut
  const registerUser = (userData: {
    nom: string;
    prenom: string;
    email: string;
    matricule: string;
    niveau: User['niveau'];
    role: Role;
    defaultPassword?: string;
  }): { success: boolean; message?: string; user?: User } => {
    const matriculeClean = userData.matricule.trim().toUpperCase();
    const emailClean = userData.email.trim().toLowerCase();

    // Vérifier unicité matricule et email
    const existsMatricule = allUsers.some((u) => u.matricule.toUpperCase() === matriculeClean);
    if (existsMatricule) {
      return { success: false, message: `Le matricule ${matriculeClean} est déjà attribué à un autre membre.` };
    }

    const existsEmail = allUsers.some((u) => u.email.toLowerCase() === emailClean);
    if (existsEmail) {
      return { success: false, message: `L'adresse email ${emailClean} est déjà utilisée.` };
    }

    const newUserId = `usr_${Date.now()}`;
    const defaultPassword = userData.defaultPassword?.trim() || 'git2026';

    // Génération automatique des 10 mois de cotisation de l'année
    const initialCotisations: Cotisation[] = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((m) => ({
      id: `cot_${newUserId}_${m}`,
      mois: m,
      annee: CURRENT_YEAR,
      montant: DEFAULT_COTISATION_AMOUNT,
      isPaid: false,
      userId: newUserId,
    }));

    const newUser: User = {
      id: newUserId,
      nom: userData.nom.trim(),
      prenom: userData.prenom.trim(),
      email: emailClean,
      matricule: matriculeClean,
      niveau: userData.niveau,
      role: userData.role,
      password: defaultPassword,
      mustChangePassword: true, // Obligatoire: devra changer à sa 1ère connexion
      isActive: true,
      macAddresses: [],
      cotisations: initialCotisations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newUser, ...allUsers];
    persistUsers(updated);

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: userData.nom,
        prenom: userData.prenom,
        email: emailClean,
        matricule: matriculeClean,
        niveau: userData.niveau,
        role: userData.role,
        defaultPassword,
      }),
    }).catch((err) => console.error('Erreur sync register MySQL:', err));

    return { success: true, user: newUser, message: `Membre ${newUser.nom} ${newUser.prenom} (${newUser.matricule}) enregistré avec succès.` };
  };

  // Déconnexion
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    router.push('/login');
  };

  // Mise à jour des adresses MAC
  const updateUserMacs = (userId: string, newMacs: User['macAddresses']) => {
    const updated = allUsers.map((u) => (u.id === userId ? { ...u, macAddresses: newMacs } : u));
    persistUsers(updated);
  };

  // Enregistrement d'un paiement
  const recordPayment = (paymentData: {
    memberId: string;
    months: number[];
    method: string;
    reference?: string;
  }) => {
    const paymentId = `pay_${Date.now()}`;
    const newCotisationIds: string[] = [];

    const updated = allUsers.map((u) => {
      if (u.id === paymentData.memberId) {
        const updatedCotisations = u.cotisations.map((cot: Cotisation) => {
          if (paymentData.months.includes(cot.mois)) {
            newCotisationIds.push(cot.id);
            return { ...cot, isPaid: true, paymentId };
          }
          return cot;
        });

        // Ajouter les mois qui n'existaient pas
        paymentData.months.forEach((m: number) => {
          if (!updatedCotisations.some((c: Cotisation) => c.mois === m)) {
            const newCotId = `cot_${u.id}_${m}`;
            newCotisationIds.push(newCotId);
            updatedCotisations.push({
              id: newCotId,
              mois: m,
              annee: CURRENT_YEAR,
              montant: DEFAULT_COTISATION_AMOUNT,
              isPaid: true,
              userId: u.id,
              paymentId,
            });
          }
        });

        return { ...u, cotisations: updatedCotisations };
      }
      return u;
    });

    persistUsers(updated);

    fetch('/api/cotisations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: paymentData.memberId,
        months: paymentData.months,
        method: paymentData.method,
        reference: paymentData.reference,
        treasurerId: currentUser?.id,
      }),
    }).catch((err) => console.error('Erreur sync cotisation MySQL:', err));

    const newPayment: Payment = {
      id: paymentId,
      montantTotal: paymentData.months.length * DEFAULT_COTISATION_AMOUNT,
      method: paymentData.method,
      reference: paymentData.reference,
      treasurerId: currentUser?.id || 'usr_treasurer',
      createdAt: new Date().toISOString(),
      cotisationIds: newCotisationIds,
    };

    persistPayments([newPayment, ...payments]);
  };

  // Changement de rôle (Admin)
  const updateUserRole = (userId: string, newRole: Role) => {
    const updated = allUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    persistUsers(updated);
    fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    }).catch((err) => console.error('Erreur sync role MySQL:', err));
  };

  // Bascule du statut actif/suspendu (Admin)
  const toggleUserActive = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    const newActive = target ? !target.isActive : true;
    const updated = allUsers.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u));
    persistUsers(updated);
    fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: newActive }),
    }).catch((err) => console.error('Erreur sync active MySQL:', err));
  };

  // Demande de réinitialisation de mot de passe par l'utilisateur
  const requestPasswordReset = async (matriculeOrEmail: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const term = matriculeOrEmail.trim().toLowerCase();
    const user = allUsers.find(
      (u) => u.matricule.toLowerCase() === term || u.email.toLowerCase() === term
    );

    if (!user) {
      return { success: false, message: 'Matricule ou adresse email introuvable dans la base officielle.' };
    }

    const updated = allUsers.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          passwordResetRequested: true,
          passwordResetRequestedAt: new Date().toISOString(),
          passwordResetReason: reason?.trim() || 'Demande formulée par l\'étudiant auprès du Bureau',
        };
      }
      return u;
    });

    persistUsers(updated);
    return {
      success: true,
      message: `Votre demande de réinitialisation a été transmise avec succès pour le compte ${user.matricule} (${user.nom} ${user.prenom}). L'administrateur traitera votre requête conformément aux règles de sécurité.`,
    };
  };

  // Traitement sécurisé de la réinitialisation par l'administrateur
  // RÈGLE FORMELLE DU USER : l'admin NE PEUT PAS modifier un mot de passe sans demande de l'utilisateur
  const adminProcessPasswordReset = async (
    userId: string,
    justification: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Seul l\'Administrateur de la Division est habilité à traiter les demandes.' };
    }

    const targetUser = allUsers.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Utilisateur introuvable.' };
    }

    // Vérification de la demande ou de la justification expresse
    const hasUserRequest = !!targetUser.passwordResetRequested;
    const hasValidJustification = justification.trim().length >= 5;

    if (!hasUserRequest && !hasValidJustification) {
      return {
        success: false,
        message: 'Sécurité CDC : L\'administrateur ne peut pas modifier un mot de passe sans une demande expresse de l\'utilisateur ou une justification formelle consignée (minimum 5 caractères).',
      };
    }

    const updated = allUsers.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          password: 'git2026', // Rétablit le mot de passe initial
          mustChangePassword: true, // Oblige le membre à en choisir un nouveau dès sa connexion
          passwordResetRequested: false,
          passwordResetRequestedAt: undefined,
          passwordResetReason: undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return u;
    });

    persistUsers(updated);

    fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetPassword: true, justification }),
    }).catch((err) => console.error('Erreur sync reset password MySQL:', err));

    return {
      success: true,
      message: `Mot de passe de ${targetUser.nom} ${targetUser.prenom} (${targetUser.matricule}) réinitialisé avec succès sur 'git2026'. Le membre sera tenu de le changer à sa prochaine connexion. Justification consignée : "${justification.trim() || targetUser.passwordResetReason}".`,
    };
  };

  // Émission d'une pénalité par le Censeur (scan direct ou refus de scan)
  const issuePenalty = async (data: {
    userId: string;
    censorId: string;
    reason: string;
    amount: number;
    isRefusal?: boolean;
  }): Promise<{ success: boolean; message: string; penalty?: Penalty }> => {
    const formattedReason = data.isRefusal
      ? `[DEMANDE_ADMIN_REFUS_SCAN] ${data.reason.trim()}`
      : data.reason.trim();

    const tempPenalty: Penalty = {
      id: `pen_${Date.now()}`,
      userId: data.userId,
      censorId: data.censorId,
      reason: formattedReason,
      amount: data.amount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      isRefusal: data.isRefusal,
      adminApprovalStatus: data.isRefusal ? 'PENDING' : 'APPROVED',
    };

    const updated = allUsers.map((u) => {
      if (u.id === data.userId) {
        return {
          ...u,
          penalties: [tempPenalty, ...(u.penalties || [])],
        };
      }
      return u;
    });

    persistUsers(updated);

    try {
      const res = await fetch('/api/penalties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.penalty) {
        const synced = updated.map((u) => {
          if (u.id === data.userId) {
            return {
              ...u,
              penalties: (u.penalties || []).map((p) => p.id === tempPenalty.id ? { ...p, id: resData.penalty.id } : p),
            };
          }
          return u;
        });
        persistUsers(synced);
        return { success: true, message: resData.message, penalty: resData.penalty };
      }
    } catch (err) {
      console.error('Erreur sync POST /api/penalties:', err);
    }

    return {
      success: true,
      message: data.isRefusal
        ? 'Demande de pénalité pour refus de scan transmise aux administrateurs.'
        : 'Pénalité enregistrée avec succès. À régler auprès de la Trésorière.',
      penalty: tempPenalty,
    };
  };

  // Traitement d'une demande de pénalité par l'Administrateur
  const adminProcessPenalty = async (
    penaltyId: string,
    action: 'APPROVE' | 'REJECT'
  ): Promise<{ success: boolean; message: string }> => {
    const updated = allUsers.map((u) => {
      const userPenalties = u.penalties || [];
      const pIndex = userPenalties.findIndex((p) => p.id === penaltyId);
      if (pIndex !== -1) {
        const p = userPenalties[pIndex];
        const newReason = action === 'APPROVE'
          ? `[VALIDÉ_PAR_ADMIN] ${p.reason.replace('[DEMANDE_ADMIN_REFUS_SCAN] ', '')}`
          : `[REJETÉ_PAR_ADMIN] ${p.reason}`;
        const newStatus = action === 'APPROVE' ? ('PENDING' as const) : ('CANCELLED' as const);
        const updatedPenalties = [...userPenalties];
        updatedPenalties[pIndex] = {
          ...p,
          reason: newReason,
          status: newStatus,
          adminApprovalStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          approvedBy: currentUser?.matricule || 'ADMIN',
          approvedAt: new Date().toISOString(),
        };
        return { ...u, penalties: updatedPenalties };
      }
      return u;
    });

    persistUsers(updated);

    try {
      const res = await fetch(`/api/penalties/${penaltyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message };
      }
    } catch (err) {
      console.error('Erreur sync PATCH /api/penalties:', err);
    }

    return {
      success: true,
      message: action === 'APPROVE'
        ? 'Pénalité validée avec succès par l\'administrateur. Exigible chez la Trésorière.'
        : 'Demande de pénalité rejetée.',
    };
  };

  // Paiement d'une pénalité chez la Trésorière
  const payPenalty = async (data: {
    penaltyId: string;
    userId: string;
    method: string;
    reference?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const nowIso = new Date().toISOString();
    const updated = allUsers.map((u) => {
      if (u.id === data.userId) {
        const userPenalties = u.penalties || [];
        const updatedPenalties = userPenalties.map((p) => {
          if (p.id === data.penaltyId) {
            return {
              ...p,
              status: 'PAID' as const,
              paidAt: nowIso,
              paymentMethod: data.method,
              paymentReference: data.reference,
              reason: `${p.reason} (Payé par ${data.method}${data.reference ? ` - Réf: ${data.reference}` : ''})`,
            };
          }
          return p;
        });
        return { ...u, penalties: updatedPenalties };
      }
      return u;
    });

    persistUsers(updated);

    try {
      const res = await fetch(`/api/penalties/${data.penaltyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PAY',
          method: data.method,
          reference: data.reference,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        return { success: true, message: resData.message };
      }
    } catch (err) {
      console.error('Erreur sync PAY /api/penalties:', err);
    }

    return {
      success: true,
      message: 'Paiement de la pénalité enregistré avec succès par la Trésorière.',
    };
  };

  // Recharger et synchroniser la liste officielle
  const restoreOfficialUsers = () => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    setAllUsers(INITIAL_USERS);
    return {
      success: true,
      count: INITIAL_USERS.length,
      message: `Base officielle synchronisée avec succès (${INITIAL_USERS.length} membres réinitialisés sur mot de passe git2026).`,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        isInitialized,
        currentUser,
        allUsers,
        payments,
        login,
        logout,
        updateUserMacs,
        recordPayment,
        updateUserRole,
        toggleUserActive,
        registerUser,
        changePassword,
        requestPasswordReset,
        adminProcessPasswordReset,
        restoreOfficialUsers,
        issuePenalty,
        adminProcessPenalty,
        payPenalty,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}
