import * as cheerio from 'cheerio';
const rawContent = `
Comercio: LA PERCHA PITAL
Ciudad y país: ALAJUELA, Costa Rica
Fecha: Ago 28, 2026 , 10:13
MASTER: ************2304
Autorización: 990516
Referencia: 624010135054
Tipo de Transacción: COMPRA
Monto: CRC 1,900.00
`;
const subject = 'Notificación de transacción LA PERCHA PITAL 28-08-2026 - 10:13';

let merchant = 'Desconocido';
let amount = 0;
let currency = 'CRC';
let accountInfo = '';
let transactionType = 'COMPRA';
let date = new Date();

const $ = cheerio.load(rawContent);
const textContent = $.text().replace(/\s+/g, ' '); 
console.log('TEXT:', textContent);

const amountMatch = textContent.match(/(CRC|USD|Monto:)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
if (amountMatch) {
    if (amountMatch[1] && (amountMatch[1].toUpperCase() === 'CRC' || amountMatch[1].toUpperCase() === 'USD')) {
        currency = amountMatch[1].toUpperCase();
    }
    amount = parseFloat(amountMatch[2].replace(/,/g, ''));
}
console.log('Amount:', amount, currency);

const merchantMatchBody = textContent.match(/Comercio:\s*([^RMFT][a-zA-Z0-9\s*.\-]*?(?=\s*(Monto|Fecha|Tarjeta|Autorizaci|Terminal|Moneda|$)))/i);
if (merchantMatchBody && merchantMatchBody[1]) {
    merchant = merchantMatchBody[1].trim();
}
console.log('Merchant:', merchant);

const subjectRegex = /Notificaci[oó]n de transacci[oó]n\s+(.*?)\s+(\d{2}-\d{2}-\d{4})\s+-\s+(\d{2}:\d{2})/i;
const matchSubject = subject.match(subjectRegex);
if (matchSubject) {
    if (merchant === 'Desconocido') {
        merchant = matchSubject[1].trim();
    }
    const dateParts = matchSubject[2].split('-');
    const timeParts = matchSubject[3].split(':');
    if (dateParts.length === 3) {
        date = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]), Number(timeParts[0]), Number(timeParts[1]));
    }
}
console.log('Date:', date);

const accountMatch = textContent.match(/(MASTER|VISA)\s*[:]?\s*\*+\d{4}/i);
if (accountMatch) {
    accountInfo = accountMatch[0].trim();
}
console.log('Account:', accountInfo);

console.log('Result:', { date, merchant, amount, currency, accountInfo, transactionType });
