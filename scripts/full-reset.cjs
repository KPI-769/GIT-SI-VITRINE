const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Remise à zéro complète des données financières...\n');

  // 1. Supprimer TOUS les paiements
  const pay = await prisma.payment.deleteMany({});
  console.log(`✅ Paiements supprimés : ${pay.count}`);

  // 2. Remettre toutes les cotisations à isPaid: false, montant: 0, paymentId: null
  const cot = await prisma.cotisation.updateMany({
    data: { isPaid: false, paymentId: null, montant: 0 },
  });
  console.log(`✅ Cotisations remises à zéro : ${cot.count}`);

  // 3. Supprimer toutes les pénalités
  const pen = await prisma.penalty.deleteMany({});
  console.log(`✅ Pénalités supprimées : ${pen.count}`);

  // 4. Vérification
  const pCount = await prisma.payment.count();
  const cCount = await prisma.cotisation.count({ where: { isPaid: true } });
  console.log(`\n📊 État final :`);
  console.log(`   Paiements restants : ${pCount}`);
  console.log(`   Cotisations payées : ${cCount}`);
  console.log('\n✅ Base TiDB remise à zéro.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

