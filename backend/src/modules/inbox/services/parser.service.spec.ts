import { Test, TestingModule } from '@nestjs/testing';
import { ParserService } from './parser.service';

describe('ParserService', () => {
    let service: ParserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ParserService],
        }).compile();

        service = module.get<ParserService>(ParserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('parseBacEmail', () => {
        it('should correctly parse a standard CRC purchase email', () => {
            const emailContent = `
        <p>Estimado(a) Cliente:</p>
        <p>Le informamos que se ha realizado la siguiente transacción con su tarjeta:</p>
        <p><strong>Comercio:</strong> SUPER RIO CUARTO</p>
        <p><strong>Monto:</strong> CRC 3,500.00</p>
        <p><strong>Fecha:</strong> 24/02/2026</p>
        <p><strong>Tarjeta:</strong> MASTER ***5028</p>
        <p>Gracias por utilizar nuestros servicios.</p>
      `;

            const result = service.parseBacEmail(emailContent);

            expect(result).toBeDefined();
            expect(result?.merchant).toBe('SUPER RIO CUARTO');
            expect(result?.amount).toBe(3500);
            expect(result?.currency).toBe('CRC');
            expect(result?.accountInfo).toBe('MASTER ***5028');

            // La fecha se parsea como: new Date(2026, 1, 24) -> El mes es 0-indexed
            expect(result?.date.getFullYear()).toBe(2026);
            expect(result?.date.getMonth()).toBe(1); // Febrero
            expect(result?.date.getDate()).toBe(24);
        });

        it('should correctly parse a USD purchase email without decimals', () => {
            const emailContent = `
        Comercio: AMAZON WEB SERVICES
        Monto: USD 150
        Fecha: 15/03/2026
        Tarjeta: VISA ***1234
      `;

            const result = service.parseBacEmail(emailContent);

            expect(result).toBeDefined();
            expect(result?.merchant).toBe('AMAZON WEB SERVICES');
            expect(result?.amount).toBe(150);
            expect(result?.currency).toBe('USD');
            expect(result?.accountInfo).toBe('VISA ***1234');
        });

        it('should handle missing date gracefully (fallback to today)', () => {
            const emailContent = `
        Comercio: UBER TRIP
        Monto: CRC 4,200.50
        Tarjeta: MASTER ***5028
      `;

            const result = service.parseBacEmail(emailContent);
            const today = new Date();

            expect(result).toBeDefined();
            expect(result?.merchant).toBe('UBER TRIP');
            expect(result?.amount).toBe(4200.5);
            expect(result?.currency).toBe('CRC');

            // Should default to today
            expect(result?.date.getDate()).toBe(today.getDate());
            expect(result?.date.getMonth()).toBe(today.getMonth());
        });

        it('should correctly handle thousands separators in amount', () => {
            const emailContent = `
        Comercio: AGENCIA DE VIAJES
        Monto: USD 1,250.75
        Fecha: 10/01/2026
        Tarjeta: VISA ***9999
      `;

            const result = service.parseBacEmail(emailContent);

            expect(result).toBeDefined();
            expect(result?.amount).toBe(1250.75);
        });
    });
});
