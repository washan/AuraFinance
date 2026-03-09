import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BankConnection } from '@prisma/client';
import * as imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { ParserService } from './parser.service';

@Injectable()
export class ImapService {
    private readonly logger = new Logger(ImapService.name);

    constructor(
        private prisma: PrismaService,
        private parserService: ParserService,
    ) { }

    async syncAllActiveConnections() {
        this.logger.log('Starting global IMAP sync for active connections...');
        const connections = await this.prisma.bankConnection.findMany({
            where: { isActive: true },
        });

        for (const connection of connections) {
            if (connection.provider === 'GMAIL') {
                try {
                    await this.syncForConnection(connection);
                } catch (error) {
                    this.logger.error(`Failed to sync connection ${connection.id}: ${error.message}`);
                }
            }
        }
        this.logger.log('Finished global IMAP sync.');
    }

    async syncForConnection(connection: BankConnection) {
        this.logger.log(`Syncing connection for email: ${connection.emailAddress}`);

        const config = {
            imap: {
                user: connection.emailAddress,
                password: connection.appPassword, // Decryption should happen here if encrypted in DB
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 3000,
                tlsOptions: { rejectUnauthorized: false }
            }
        };

        let imapConnection;
        try {
            imapConnection = await imaps.connect(config);
            await imapConnection.openBox('INBOX');

            // Buscar correos no leídos que provengan del dominio del BAC
            const searchCriteria = ['UNSEEN', ['FROM', 'notificacionesbaccr.com']];
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
                markSeen: true,
                struct: true
            };

            this.logger.log(`Searching IMAP with criteria: ${JSON.stringify(searchCriteria)}`);
            const messages = await imapConnection.search(searchCriteria, fetchOptions);
            this.logger.log(`Found ${messages.length} new messages from BAC Credomatic.`);

            for (const item of messages) {
                const all = item.parts.find((p: any) => p.which === '');
                if (!all) continue;
                const id = item.attributes.uid;
                const idHeader = 'Imap-Id: ' + id + '\r\n';

                let mail;
                try {
                    mail = await simpleParser(idHeader + all.body);
                } catch (e) {
                    this.logger.error(`Failed to parse mail ID ${id}:`, e);
                    continue;
                }

                const rawContent = mail.text || mail.html || '';

                this.logger.log(`Parsing email from: ${mail.from?.text || 'unknown'}, Subject: ${mail.subject}`);

                // Parsear contenido pasando también el Asunto
                const parsedData = this.parserService.parseBacEmail(rawContent, mail.subject);

                if (parsedData) {
                    // Check if already exists in DB by messageId equivalent
                    const messageId = mail.messageId || String(id);
                    const existing = await this.prisma.inboxTransaction.findFirst({
                        where: { sourceId: messageId, bankConnectionId: connection.id }
                    });

                    if (!existing) {
                        await this.prisma.inboxTransaction.create({
                            data: {
                                bankConnectionId: connection.id,
                                sourceId: messageId,
                                date: parsedData.date,
                                merchant: parsedData.merchant,
                                amount: parsedData.amount,
                                currency: parsedData.currency,
                                accountInfo: parsedData.accountInfo,
                                transactionType: parsedData.transactionType,
                                rawContent: rawContent.substring(0, 2000), // Trim content if too long
                                status: 'PENDING',
                            }
                        });
                        this.logger.log(`Created new pending transaction for merchant: ${parsedData.merchant}`);
                    }
                } else {
                    this.logger.warn(`Could not extract transaction data from email ID ${id}`);
                }
            }

            await this.prisma.bankConnection.update({
                where: { id: connection.id },
                data: { lastSyncAt: new Date() }
            });

        } catch (error) {
            this.logger.error(`IMAP sync error for ${connection.emailAddress}:`, error);
            throw error;
        } finally {
            if (imapConnection) {
                imapConnection.end();
            }
        }
    }
}
