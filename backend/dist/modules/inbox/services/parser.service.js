"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var ParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserService = void 0;
const common_1 = require("@nestjs/common");
const cheerio = __importStar(require("cheerio"));
let ParserService = ParserService_1 = class ParserService {
    logger = new common_1.Logger(ParserService_1.name);
    parseBacEmail(rawContent, subject) {
        try {
            let merchant = 'Desconocido';
            let amount = 0;
            let currency = 'CRC';
            let accountInfo = '';
            let transactionType = 'COMPRA';
            let date = new Date();
            const $ = cheerio.load(rawContent);
            const textContent = $.text().replace(/\s+/g, ' ');
            const amountMatch = textContent.match(/(CRC|USD|Monto:)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
            if (amountMatch) {
                if (amountMatch[1] && (amountMatch[1].toUpperCase() === 'CRC' || amountMatch[1].toUpperCase() === 'USD')) {
                    currency = amountMatch[1].toUpperCase();
                }
                amount = parseFloat(amountMatch[2].replace(/,/g, ''));
            }
            const merchantMatchBody = textContent.match(/Comercio:\s*([^RMFT][a-zA-Z0-9\s*.\-]*?(?=\s*(Monto|Fecha|Tarjeta|Autorizaci|Terminal|Moneda|$)))/i);
            if (merchantMatchBody && merchantMatchBody[1]) {
                merchant = merchantMatchBody[1].trim();
            }
            const dateMatchBody = textContent.match(/Fecha:\s*(\d{2}\/\d{2}\/\d{4})/i);
            if (dateMatchBody && dateMatchBody[1]) {
                const parts = dateMatchBody[1].split('/');
                if (parts.length === 3) {
                    date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                }
            }
            if (subject) {
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
            }
            const accountMatch = textContent.match(/(MASTER|VISA)\s*\*{3,4}\d{4}/i);
            if (accountMatch) {
                accountInfo = accountMatch[0].trim();
            }
            if (amount === 0) {
                this.logger.warn("Parsed amount is 0, possibly parsing failed");
            }
            return {
                date,
                merchant,
                amount,
                currency,
                accountInfo,
                transactionType
            };
        }
        catch (e) {
            this.logger.error("Failed to parse BAC email", e);
            return null;
        }
    }
};
exports.ParserService = ParserService;
exports.ParserService = ParserService = ParserService_1 = __decorate([
    (0, common_1.Injectable)()
], ParserService);
//# sourceMappingURL=parser.service.js.map