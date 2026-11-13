const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Supprimer les cotisations liées aux paiements de test (clé étrangère)
  const deleted = await prisma.cotisation.updateMany({
    where: {
      paymentId: {
        in: [
          'cmw5zeus90001k3089j4logj7',
          'cmwbx7vxx0001ju07o97p8ggi',
          'cmwdhnjdu0001i4078qbouoqo',
        ],
      },
    },
    data: { paymentId: null, isPaid: false },
  });
  console.log(`Cotisations dissociées: ${deleted.count}`);

  // 2. Supprimer les 3 paiements de test
  const result = await prisma.payment.deleteMany({
    where: {
      id: {
        in: [
          'cmw5zeus90001k3089j4logj7',
          'cmwbx7vxx0001ju07o97p8ggi',
          'cmwdhnjdu0001i4078qbouoqo',
        ],
      },
    },
  });
  console.log(`Paiements de test supprimés: ${result.count}`);

  // 3. Vérification
  const remaining = await prisma.payment.count();
  console.log(`Paiements restants en base: ${remaining}`);
  console.log('✅ Solde remis à zéro.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
