const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reset() {
    console.log('Clearing WhatsApp sessions from database...');
    await prisma.whatsAppSession.deleteMany({});
    console.log('Done! Please restart the Render web service.');
}
reset().catch(console.error).finally(() => prisma.$disconnect());
