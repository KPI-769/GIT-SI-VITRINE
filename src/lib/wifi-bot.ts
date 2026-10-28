/**
 * Service Bot de Gestion des Accès Wi-Fi & Révocation du 15 du Mois
 * Division Génie Infotronique (GIT)
 * Référence : GIT-CDC-2026-001 & GIT-DAT-2026-001
 */

import { User, MacAddress, CURRENT_MONTH, CURRENT_YEAR } from './types';

export interface EvictionRecord {
  userId: string;
  matricule: string;
  nom: string;
  prenom: string;
  niveau: string;
  email: string;
  phone?: string;
  macAddresses: MacAddress[];
  reasons: string[];
  unpaidCotisation: boolean;
  pendingPenaltiesCount: number;
  totalDue: number; // Cotisation + Pénalités
  evictionDate: string;
}

export interface BotExecutionReport {
  executionDate: string;
  cutoffDay: number;
  isPastCutoff: boolean;
  totalMembersEvaluated: number;
  totalMacsMonitored: number;
  whitelistedMacsCount: number;
  evictedMembersCount: number;
  evictedMacsCount: number;
  evictionList: EvictionRecord[];
  routerOsEvictionScript: string;
  dlinkEvictionCommands: string[];
}

export class WifiAccessBot {
  private cutoffDay: number;

  constructor(cutoffDay: number = 15) {
    this.cutoffDay = cutoffDay;
  }

  /**
   * Vérifie si le jour actuel est supérieur ou égal au jour de coupure (15 du mois)
   */
  public isCutoffDateReached(date: Date = new Date()): boolean {
    return date.getDate() >= this.cutoffDay;
  }

  /**
   * Évalue l'éligibilité d'un utilisateur selon les critères CDC/DAT :
   * 1. Cotisation du mois réglée
   * 2. Aucune pénalité en attente (COUNT == 0)
   * 3. Compte actif
   */
  public evaluateMemberEligibility(
    user: User,
    referenceMonth: number = CURRENT_MONTH,
    referenceYear: number = CURRENT_YEAR
  ): {
    isEligible: boolean;
    reasons: string[];
    unpaidCotisation: boolean;
    pendingPenaltiesCount: number;
    totalDue: number;
  } {
    const reasons: string[] = [];
    let unpaidCotisation = false;
    let totalDue = 0;

    // Cotisation du mois
    const currentCot = user.cotisations.find(
      c => c.mois === referenceMonth && c.annee === referenceYear
    );
    if (!currentCot || !currentCot.isPaid) {
      unpaidCotisation = true;
      const cotAmount = currentCot?.montant || 2000;
      totalDue += cotAmount;
      reasons.push(`Cotisation ${referenceMonth}/${referenceYear} impayée (${cotAmount.toLocaleString('fr-FR')} FCFA)`);
    }

    // Pénalités non réglées
    const pendingPenalties = user.penalties?.filter(p => p.status === 'PENDING') || [];
    if (pendingPenalties.length > 0) {
      const penTotal = pendingPenalties.reduce((sum, p) => sum + p.amount, 0);
      totalDue += penTotal;
      reasons.push(`${pendingPenalties.length} pénalité(s) disciplinaire(s) non réglée(s) (${penTotal.toLocaleString('fr-FR')} FCFA)`);
    }

    // Compte actif
    if (!user.isActive) {
      reasons.push('Compte suspendu par le Bureau Administratif');
    }

    // Pas de matériel enregistré
    if (!user.macAddresses || user.macAddresses.length === 0) {
      reasons.push('Aucun équipement (adresse MAC) déclaré');
    }

    const isEligible = reasons.length === 0 && user.isActive && !unpaidCotisation && pendingPenalties.length === 0 && user.macAddresses.length > 0;

    return {
      isEligible,
      reasons,
      unpaidCotisation,
      pendingPenaltiesCount: pendingPenalties.length,
      totalDue
    };
  }

  /**
   * Génère le rapport d'éviction du 15 du mois
   */
  public generateCutoffReport(
    users: User[],
    currentDate: Date = new Date(),
    referenceMonth: number = CURRENT_MONTH,
    referenceYear: number = CURRENT_YEAR
  ): BotExecutionReport {
    const isPastCutoff = this.isCutoffDateReached(currentDate);
    const evictionList: EvictionRecord[] = [];
    let totalMacsMonitored = 0;
    let whitelistedMacsCount = 0;
    let evictedMacsCount = 0;

    users.forEach(user => {
      totalMacsMonitored += user.macAddresses.length;
      const evalResult = this.evaluateMemberEligibility(user, referenceMonth, referenceYear);

      if (!evalResult.isEligible) {
        evictedMacsCount += user.macAddresses.length;
        evictionList.push({
          userId: user.id,
          matricule: user.matricule,
          nom: user.nom,
          prenom: user.prenom,
          niveau: user.niveau,
          email: user.email,
          phone: user.phone,
          macAddresses: user.macAddresses,
          reasons: evalResult.reasons,
          unpaidCotisation: evalResult.unpaidCotisation,
          pendingPenaltiesCount: evalResult.pendingPenaltiesCount,
          totalDue: evalResult.totalDue,
          evictionDate: currentDate.toISOString()
        });
      } else {
        whitelistedMacsCount += user.macAddresses.length;
      }
    });

    // Génération du script RouterOS Mikrotik pour révocation
    const routerOsEvictionScript = this.buildRouterOsEvictionScript(evictionList, currentDate);

    // Commandes compatibles D-Link / CLI Routeur
    const dlinkEvictionCommands = this.buildDlinkEvictionCommands(evictionList);

    return {
      executionDate: currentDate.toISOString(),
      cutoffDay: this.cutoffDay,
      isPastCutoff,
      totalMembersEvaluated: users.length,
      totalMacsMonitored,
      whitelistedMacsCount,
      evictedMembersCount: evictionList.length,
      evictedMacsCount,
      evictionList,
      routerOsEvictionScript,
      dlinkEvictionCommands
    };
  }

  /**
   * Construit le script RouterOS Mikrotik (.rsc) pour passer les MACs en mode 'blocked' ou les supprimer
   */
  public buildRouterOsEvictionScript(evictions: EvictionRecord[], date: Date): string {
    let script = `# =====================================================================\n`;
    script += `# SCRIPT DE RÉVOCATION WI-FI ROUTEROS (MIKROTIK) - ÉCHÉANCE DU 15 DU MOIS\n`;
    script += `# Plateforme GIT · Division Génie Infotronique (Polytech)\n`;
    script += `# Date d'exécution automatique : ${date.toLocaleString('fr-FR')}\n`;
    script += `# Membres révoqués : ${evictions.length}\n`;
    script += `# =====================================================================\n\n`;

    script += `/log info "GIT_BOT: Debut de la purge mensuelle du 15 du mois"\n\n`;

    evictions.forEach(m => {
      m.macAddresses.forEach(mac => {
        script += `# Membre: ${m.matricule} - ${m.nom} ${m.prenom} (${m.reasons.join(', ')})\n`;
        // Supprime l'autorisation existante
        script += `/ip hotspot ip-binding remove [find mac-address="${mac.address}"]\n`;
        // Ajoute la règle de blocage explicite
        script += `/ip hotspot ip-binding add mac-address="${mac.address}" type="blocked" comment="GIT_PURGE_15TH: ${m.matricule} - Impaye"\n`;
      });
    });

    script += `\n/log warning "GIT_BOT: Purge terminee - ${evictions.length} membres et leurs adresses MAC ont ete bloques."\n`;
    return script;
  }

  /**
   * Construit les commandes CLI standard D-Link pour le filtrage MAC
   */
  public buildDlinkEvictionCommands(evictions: EvictionRecord[]): string[] {
    const commands: string[] = [];
    evictions.forEach(m => {
      m.macAddresses.forEach(mac => {
        commands.push(`config mac_filter delete vlan default mac ${mac.address}`);
        commands.push(`create mac_filter deny vlan default mac ${mac.address} desc "${m.matricule}"`);
      });
    });
    return commands;
  }
}

// Instance singleton prête à l'emploi
export const wifiBot = new WifiAccessBot(15);
