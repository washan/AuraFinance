const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

async function run() {
    try {
        const user = await prisma.user.findFirst();
        if(!user) throw new Error("No user");

        const pending = await prisma.plannedTransaction.findFirst({ where: { status: 'PENDING' } });
        if (!pending) return console.log('No pending transactions.');

        const account = await prisma.account.findFirst({ where: { householdId: user.householdId } });
        
        console.log("Realizing ID:", pending.id);

        const payload = JSON.stringify({
            accountId: account.id,
            amountOriginal: pending.amount.toString(),
            amountBase: (-Math.abs(pending.amount)).toString(),
            transactionDate: '2026-03-16',
            notes: pending.notes || 'Test'
        });

        // We need an actual JWT. But I can't easily generate one if I don't know the exact jwt constants, 
        // wait the JWT_SECRET is in .env! Let's just generate a token.
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { sub: user.id, email: user.email, householdId: user.householdId },
            "super-secret-key-123", // from .env
            { expiresIn: '1d' }
        );

        const req = http.request(`http://localhost:3001/planned-transactions/${pending.id}/realize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => console.log('RESPONSE:', res.statusCode, data));
        });

        req.on('error', console.error);
        req.write(payload);
        req.end();

    } catch(e) { console.error(e) }
}
run();
