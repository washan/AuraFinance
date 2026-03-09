import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

interface ParsedTransaction {
    date: Date;
    merchant: string;
    amount: number;
    currency: string;
    accountInfo: string;
    transactionType: string;
}

@Injectable()
export class ParserService {
    private readonly logger = new Logger(ParserService.name);

    /**
     * Parses emails from BAC Credomatic
     * @param rawContent Raw text or HTML from the email body
     * @param subject Optional email subject for robust metadata extraction
     * @returns ParsedTransaction or null if it fails
     */
    parseBacEmail(rawContent: string, subject?: string): ParsedTransaction | null {
        try {
            // Example logic block assuming HTML or structured text from BAC Credomatic
            // This will likely need adjustment based on exact email structure.

            let merchant = 'Desconocido';
            let amount = 0;
            let currency = 'CRC';
            let accountInfo = '';
            let transactionType = 'COMPRA';
            let date = new Date();

            // Strip HTML to get plain text
            const $ = cheerio.load(rawContent);
            const textContent = $.text().replace(/\s+/g, ' '); // Normalize whitespace

            // Extract Amount
            const amountMatch = textContent.match(/(CRC|USD|Monto:)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
            if (amountMatch) {
                if (amountMatch[1] && (amountMatch[1].toUpperCase() === 'CRC' || amountMatch[1].toUpperCase() === 'USD')) {
                    currency = amountMatch[1].toUpperCase();
                }
                amount = parseFloat(amountMatch[2].replace(/,/g, ''));
            }

            // Extract Merchant
            const merchantMatchBody = textContent.match(/Comercio:\s*([^RMFT][a-zA-Z0-9\s*.\-]*?(?=\s*(Monto|Fecha|Tarjeta|Autorizaci|Terminal|Moneda|$)))/i);
            if (merchantMatchBody && merchantMatchBody[1]) {
                merchant = merchantMatchBody[1].trim();
            }

            // Look for date
            const dateMatchBody = textContent.match(/Fecha:\s*(\d{2}\/\d{2}\/\d{4})/i);
            if (dateMatchBody && dateMatchBody[1]) {
                const parts = dateMatchBody[1].split('/');
                if (parts.length === 3) {
                    date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                }
            }

            // Fallback: If merchant is still Desconocido or date is today (default), try extracting from Subject
            // Example Subject: Notificación de transacción SUPER RIO CUARTO 25-02-2026 - 20:54
            if (subject) {
                const subjectRegex = /Notificaci[oó]n de transacci[oó]n\s+(.*?)\s+(\d{2}-\d{2}-\d{4})\s+-\s+(\d{2}:\d{2})/i;
                const matchSubject = subject.match(subjectRegex);
                if (matchSubject) {
                    if (merchant === 'Desconocido') {
                        merchant = matchSubject[1].trim();
                    }
                    // Override the date with the subject date which is highly reliable (DD-MM-YYYY)
                    const dateParts = matchSubject[2].split('-');
                    const timeParts = matchSubject[3].split(':');
                    if (dateParts.length === 3) {
                        date = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]), Number(timeParts[0]), Number(timeParts[1]));
                    }
                }
            }

            // Look for account/card: "MASTER ***5028"
            const accountMatch = textContent.match(/(MASTER|VISA)\s*\*{3,4}\d{4}/i);
            if (accountMatch) {
                accountInfo = accountMatch[0].trim();
            }

            if (amount === 0) {
                this.logger.warn("Parsed amount is 0, possibly parsing failed");
                // return null; // Un-comment to strictly reject unparsed amounts
            }

            return {
                date,
                merchant,
                amount,
                currency,
                accountInfo,
                transactionType
            };
        } catch (e) {
            this.logger.error("Failed to parse BAC email", e);
            return null;
        }
    }
}
