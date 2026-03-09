import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const household = await prisma.household.findFirst();
    if (!household) {
        console.log("No household found");
        return;
    }
    const householdId = household.id;

    console.log("Household ID:", householdId);

    // 1. Investment Accounts
    const investmentAccounts = await prisma.account.findMany({
        where: { householdId, type: 'investment' }
    });
    console.log("Investment Accounts:", investmentAccounts.map(a => ({ id: a.id, name: a.name, balance: a.balance })));
    const invAccountIds = investmentAccounts.map(a => a.id);

    // 2. Goals
    const goals = await prisma.goal.findMany({
        where: { householdId },
        include: { transactions: true }
    });
    console.log("Goals:");
    let goalSavings = 0;
    goals.forEach(g => {
        g.transactions.forEach((t: any) => {
            console.log(`  Goal Tx: type=${t.type}, amount=${t.amountBase}, dest=${t.destinationAccountId}`);
            if (t.type === 'transfer' && invAccountIds.includes(t.destinationAccountId)) {
                console.log("  -> SKIPPED (destination is investment account)");
                return;
            }
            if (t.type === 'income' && invAccountIds.includes(t.accountId)) {
                console.log("  -> SKIPPED (income to investment account)");
                return;
            }
            goalSavings += parseFloat(t.amountBase.toString());
        });
    });
    console.log("Goal savings contribution:", goalSavings);

    // 3. Pure savings
    const savingsTransactions = await prisma.transaction.findMany({
        where: {
            user: { householdId },
            goalId: null,
            item: { category: { type: 'ahorro' } }
        }
    });

    console.log("Savings Transactions:");
    let pureSavings = 0;
    savingsTransactions.forEach((tx: any) => {
        console.log(`  Tx: type=${tx.type}, amount=${tx.amountBase}, dest=${tx.destinationAccountId}`);
        if (tx.type === 'transfer' && invAccountIds.includes(tx.destinationAccountId)) {
            console.log("  -> SKIPPED (destination is investment account)");
            return;
        }
        if (tx.type === 'income' && invAccountIds.includes(tx.accountId)) {
            console.log("  -> SKIPPED (income to investment account)");
            return;
        }
        pureSavings += Math.abs(parseFloat(tx.amountBase.toString()));
    });
    console.log("Pure savings contribution:", pureSavings);

    console.log("Total Active Savings:",
        investmentAccounts.reduce((sum, a) => sum + parseFloat(a.balance.toString()), 0) +
        goalSavings + pureSavings
    );
}

main().catch(console.error).finally(() => prisma.$disconnect());
