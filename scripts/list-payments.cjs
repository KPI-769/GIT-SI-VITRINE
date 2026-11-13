const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const payments = await prisma.payment.findMany({
    select: { id: true, montantTotal: true, createdAt: true, treasurerId: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log('=== PAIEMENTS EN BASE TIDB ===');
  payments.forEach((p, i) => {
    console.log(`[${i+1}] ID: ${p.id} | Montant: ${Number(p.montantTotal)} FCFA | Date: ${p.createdAt} | Trésorier: ${p.treasurerId}`);
  });
  console.log(`\nTotal: ${payments.length} paiement(s)`);
  const total = payments.reduce((s, p) => s + Number(p.montantTotal), 0);
  console.log(`Somme: ${total.toLocaleString('fr-FR')} FCFA`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

