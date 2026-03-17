import { PrismaClient } from '@prisma/client';
import { TransactionsService } from './src/modules/transactions/transactions.service';
import { PlannedTransactionsService } from './src/modules/planned-transactions/planned-transactions.service';

const prisma = new PrismaClient();
const tx = new TransactionsService(prisma as any);
const pt = new PlannedTransactionsService(prisma as any, tx);

async function run() {
    try {
        const user = await prisma.user.findFirst();
        if(!user) throw new Error("No user");

        const pending = await prisma.plannedTransaction.findFirst({ where: { status: 'PENDING' } });
        if (!pending) return console.log('No pending.');

        const account = await prisma.account.findFirst({ where: { householdId: user.householdId } });
        
        console.log("Realizing ID:", pending.id);

        const res = await pt.realize(user.id, user.householdId, pending.id, { 
            accountId: account.id, 
            amountOriginal: pending.amount.toString(), 
            amountBase: pending.amount.toString(), 
            transactionDate: new Date().toISOString() 
        });
        
        console.log('SUCCESS:', res.transaction.id);
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
