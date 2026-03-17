const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const user = await prisma.user.findFirst();
        if(!user) throw new Error("No user");

        const pending = await prisma.plannedTransaction.findFirst({ where: { status: 'PENDING' } });
        if (!pending) return console.log('No pending.');

        const account = await prisma.account.findFirst({ where: { householdId: user.householdId } });
        
        console.log("Realizing ID:", pending.id);

        const tx = await prisma.$transaction(async (t) => {
            const transaction = await t.transaction.create({
                data: {
                    userId: user.id,
                    accountId: account.id,
                    type: pending.type,
                    itemId: pending.itemId,
                    projectId: pending.projectId,
                    amountOriginal: pending.amount,
                    currencyOriginal: pending.currency,
                    exchangeRate: 1,
                    amountBase: Math.abs(pending.amount),
                    transactionDate: new Date(),
                    notes: pending.notes,
                    status: 'CLASSIFIED'
                }
            });

            await t.account.update({
                where: { id: account.id },
                data: { balance: { increment: pending.amount } }
            });

            return transaction;
        });
        
        console.log('SUCCESS:', tx.id);
    } catch (err) {
        console.error('ERROR:');
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
