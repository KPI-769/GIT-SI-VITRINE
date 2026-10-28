import { NextRequest, NextResponse } from 'next/server';
import { wifiBot } from '@/lib/wifi-bot';
import { INITIAL_USERS } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const report = wifiBot.generateCutoffReport(INITIAL_USERS);
    
    // Calcul des jours restants avant le 15
    const now = new Date();
    const currentDay = now.getDate();
    const daysUntil15th = 15 - currentDay;

    return NextResponse.json({
      success: true,
      currentDay,
      cutoffDay: 15,
      isPastCutoff: currentDay >= 15,
      daysUntilCutoff: daysUntil15th > 0 ? daysUntil15th : 0,
      report,
    });
  } catch (error) {
    console.error('Erreur API Wifi Bot GET:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du calcul de la liste de coupure du 15.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, customDate } = body;

    const evalDate = customDate ? new Date(customDate) : new Date();
    const report = wifiBot.generateCutoffReport(INITIAL_USERS, evalDate);

    if (action === 'PURGE_ROUTER') {
      // Simulation / Envoi vers le contrôleur Mikrotik RouterOS
      // En production, effectue la requête REST vers http://ROUTER_IP/rest/ip/hotspot/ip-binding
      return NextResponse.json({
        success: true,
        action: 'PURGE_ROUTER',
        message: `Purge exécutée avec succès sur le routeur Mikrotik : ${report.evictedMacsCount} adresses MAC bloquées pour défaut de paiement au 15 du mois.`,
        report,
      });
    }

    if (action === 'ADD_MAC') {
      const { macAddress, matricule } = body;
      return NextResponse.json({
        success: true,
        action: 'ADD_MAC',
        message: `Adresse MAC ${macAddress} inscrite dans la Whitelist pour le membre ${matricule}.`,
        commandPreview: `/ip hotspot ip-binding add mac-address="${macAddress}" type="bypassed" comment="GIT_BOT: ${matricule}"`,
      });
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Erreur API Wifi Bot POST:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du traitement de la requête Bot.' },
      { status: 500 }
    );
  }
}
