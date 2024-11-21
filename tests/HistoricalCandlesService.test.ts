import HistoricalCandlesService from '../src/services/HistoricalCandlesService';
import BinanceClient from '../src/services/BinanceClient';
import RealTimeCandlesService from '../src/services/RealTimeCandlesService';
import { CandleChartInterval_LT } from 'binance-api-node';

// Mock das dependências
jest.mock('../src/services/BinanceClient');
jest.mock('../src/services/RealTimeCandlesService');

describe('HistoricalCandlesService', () => {
    let historicalCandlesService: HistoricalCandlesService;
    const mockSymbol = 'BTCUSDT';
    const mockInterval: CandleChartInterval_LT = '1m';
    const mockLimit = 5;

    beforeEach(() => {
        // Mock do cliente Binance
        const mockClient = {
            candles: jest.fn().mockResolvedValue([
                { startTime: 1, open: '100', high: '110', low: '90', close: '105', volume: '50' },
                { startTime: 2, open: '105', high: '115', low: '95', close: '110', volume: '60' },
            ]),
        };
        (BinanceClient.getInstance as jest.Mock).mockReturnValue({
            getClient: jest.fn().mockReturnValue(mockClient),
        });

        historicalCandlesService = new HistoricalCandlesService();

        // Espionando console.log para evitar a saída de logs durante os testes
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    it('should fetch historical candles and store them', async () => {
        const candles = await historicalCandlesService.getHistoricalCandles(mockSymbol, mockInterval, mockLimit);

        // Verifica se o método candles foi chamado com os parâmetros corretos
        const client = BinanceClient.getInstance().getClient();
        expect(client.candles).toHaveBeenCalledWith({ symbol: mockSymbol, interval: mockInterval, limit: mockLimit });

        // Verifica se os candles foram armazenados corretamente
        expect(candles).toHaveLength(2);
        expect(historicalCandlesService.getStoredCandles()).toEqual(candles);

        // Verifica se o RealTimeCandlesService foi instanciado
        expect(RealTimeCandlesService).toHaveBeenCalledWith(mockSymbol, mockInterval, historicalCandlesService);
    });

    it('should update an existing candle if openTime matches', () => {
        // Configura o histórico de candles
        historicalCandlesService['historicalCandles'] = [
            { openTime: 1, open: '100', high: '110', low: '90', close: '105', volume: '50' },
        ];

        // Atualiza o último candle
        historicalCandlesService.updateCandle({
            startTime: 1,
            open: '101',
            high: '111',
            low: '91',
            close: '106',
            volume: '55',
        });

        // Verifica se o último candle foi atualizado
        expect(historicalCandlesService.getStoredCandles()[0]).toEqual({
            openTime: 1,
            open: '101',
            high: '111',
            low: '91',
            close: '106',
            volume: '55',
            closeTime: null,
            quoteVolume: '0',
            trades: 0,
            baseAssetVolume: '0',
            quoteAssetVolume: '0',
        });
    });

    it('should add a new candle if the last one is closed', () => {
        // Configura o histórico de candles
        historicalCandlesService['historicalCandles'] = [
            { openTime: 1, open: '100', high: '110', low: '90', close: '105', volume: '50' },
        ];

        // Adiciona um novo candle
        historicalCandlesService.updateCandle({
            startTime: 2,
            open: '106',
            high: '112',
            low: '92',
            close: '107',
            volume: '60',
        });

        // Verifica se o novo candle foi adicionado
        expect(historicalCandlesService.getStoredCandles()).toHaveLength(2);
        expect(historicalCandlesService.getStoredCandles()[1]).toEqual({
            openTime: 2,
            open: '106',
            high: '112',
            low: '92',
            close: '107',
            volume: '60',
            closeTime: null,
            quoteVolume: '0',
            trades: 0,
            baseAssetVolume: '0',
            quoteAssetVolume: '0',
        });
    });

    it('should respect the limit when adding new candles', () => {
        // Configura o histórico de candles
        historicalCandlesService['historicalCandles'] = [
            { openTime: 1, open: '100', high: '110', low: '90', close: '105', volume: '50' },
            { openTime: 2, open: '105', high: '115', low: '95', close: '110', volume: '60' },
        ];
        historicalCandlesService['limit'] = 2;

        // Adiciona um novo candle
        historicalCandlesService.updateCandle({
            startTime: 3,
            open: '111',
            high: '120',
            low: '100',
            close: '115',
            volume: '70',
        });

        // Verifica se o limite foi respeitado
        const storedCandles = historicalCandlesService.getStoredCandles();
        expect(storedCandles).toHaveLength(2);
        expect(storedCandles[0].openTime).toBe(2); // O primeiro candle foi removido
        expect(storedCandles[1].openTime).toBe(3); // O novo candle foi adicionado
    });

    it('should log an error and rethrow it if fetching candles fails', async () => {
        const mockError = new Error('Failed to fetch candles');
        const client = BinanceClient.getInstance().getClient();

        // Mocka o método candles para lançar uma exceção
        client.candles = jest.fn().mockRejectedValue(mockError);

        // Espia o console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Verifica se o erro é lançado
        await expect(
            historicalCandlesService.getHistoricalCandles(mockSymbol, mockInterval, mockLimit),
        ).rejects.toThrow('Failed to fetch candles');

        // Verifica se console.error foi chamado com a mensagem correta
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            `Error fetching historical candles for ${mockSymbol}:`,
            mockError,
        );

        // Restaura o console.error
        consoleErrorSpy.mockRestore();
    });

    it('should correctly transform a candle received from RealTimeCandlesService', () => {
        // Mock do histórico inicial
        historicalCandlesService['historicalCandles'] = [];

        // Candle no formato esperado (objeto como esperado do WebSocket)
        const candleFromWebSocket = {
            startTime: 1234567890,
            open: '100',
            high: '110',
            low: '90',
            close: '105',
            volume: '50',
            closeTime: 1234567990,
            quoteVolume: '5000',
            trades: 100,
            baseAssetVolume: '40',
            quoteAssetVolume: '4500',
        };

        // Atualiza com o candle correto
        historicalCandlesService.updateCandle(candleFromWebSocket);
        expect(historicalCandlesService.getStoredCandles()[0]).toEqual({
            openTime: 1234567890,
            open: '100',
            high: '110',
            low: '90',
            close: '105',
            volume: '50',
            closeTime: 1234567990,
            quoteVolume: '5000',
            trades: 100,
            baseAssetVolume: '40',
            quoteAssetVolume: '4500',
        });
    });

    it('should correctly handle a candle with missing properties (transform default values)', () => {
        const incompleteCandle = {
            startTime: 1234567891,
        };

        historicalCandlesService.updateCandle(incompleteCandle);

        expect(historicalCandlesService.getStoredCandles()[0]).toEqual({
            openTime: 1234567891,
            open: '0',
            high: '0',
            low: '0',
            close: '0',
            volume: '0',
            closeTime: null,
            quoteVolume: '0',
            trades: 0,
            baseAssetVolume: '0',
            quoteAssetVolume: '0',
        });
    });

    it('should return default values when properties are missing', () => {
        const incompleteCandle = {
            startTime: 1234567890,
        };

        const transformedCandle = historicalCandlesService['transformCandle'](incompleteCandle);

        expect(transformedCandle).toEqual({
            openTime: 1234567890, // 'startTime' existe, então é usado
            open: '0',             // 'open' ausente, então é '0'
            high: '0',             // 'high' ausente, então é '0'
            low: '0',              // 'low' ausente, então é '0'
            close: '0',            // 'close' ausente, então é '0'
            volume: '0',           // 'volume' ausente, então é '0'
            closeTime: null,       // 'closeTime' ausente, então é null
            quoteVolume: '0',      // 'quoteVolume' ausente, então é '0'
            trades: 0,             // 'trades' ausente, então é 0
            baseAssetVolume: '0',  // 'baseAssetVolume' ausente, então é '0'
            quoteAssetVolume: '0', // 'quoteAssetVolume' ausente, então é '0'
        });
    });

    it('should correctly transform a complete candle', () => {
        const completeCandle = {
            startTime: 1234567890,
            open: '100',
            high: '110',
            low: '90',
            close: '105',
            volume: '50',
            closeTime: 1234567990,
            quoteVolume: '5000',
            trades: 100,
            baseAssetVolume: '40',
            quoteAssetVolume: '4500',
        };

        const transformedCandle = historicalCandlesService['transformCandle'](completeCandle);

        expect(transformedCandle).toEqual({
            openTime: 1234567890,   // 'startTime' existe, então é usado
            open: '100',            // 'open' existe, então é usado
            high: '110',            // 'high' existe, então é usado
            low: '90',              // 'low' existe, então é usado
            close: '105',           // 'close' existe, então é usado
            volume: '50',           // 'volume' existe, então é usado
            closeTime: 1234567990,  // 'closeTime' existe, então é usado
            quoteVolume: '5000',    // 'quoteVolume' existe, então é usado
            trades: 100,            // 'trades' existe, então é usado
            baseAssetVolume: '40',  // 'baseAssetVolume' existe, então é usado
            quoteAssetVolume: '4500', // 'quoteAssetVolume' existe, então é usado
        });
    });

    it('should return null for missing closeTime and startTime', () => {
        const candleWithoutTimes = {
            open: '100',
            high: '110',
            low: '90',
            close: '105',
            volume: '50',
        };

        const transformedCandle = historicalCandlesService['transformCandle'](candleWithoutTimes);

        expect(transformedCandle).toEqual({
            openTime: null,         // 'startTime' ausente, então é null
            open: '100',            // 'open' existe, então é usado
            high: '110',            // 'high' existe, então é usado
            low: '90',              // 'low' existe, então é usado
            close: '105',           // 'close' existe, então é usado
            volume: '50',           // 'volume' existe, então é usado
            closeTime: null,        // 'closeTime' ausente, então é null
            quoteVolume: '0',       // 'quoteVolume' ausente, então é '0'
            trades: 0,              // 'trades' ausente, então é 0
            baseAssetVolume: '0',   // 'baseAssetVolume' ausente, então é '0'
            quoteAssetVolume: '0',  // 'quoteAssetVolume' ausente, então é '0'
        });
    });

    it('should return 0 for missing properties that expect numbers or strings', () => {
        const candleWithMissingFields = {
            startTime: 1234567890,
            open: '100',
        };

        const transformedCandle = historicalCandlesService['transformCandle'](candleWithMissingFields);

        expect(transformedCandle).toEqual({
            openTime: 1234567890,  // 'startTime' existe, então é usado
            open: '100',           // 'open' existe, então é usado
            high: '0',             // 'high' ausente, então é '0'
            low: '0',              // 'low' ausente, então é '0'
            close: '0',            // 'close' ausente, então é '0'
            volume: '0',           // 'volume' ausente, então é '0'
            closeTime: null,       // 'closeTime' ausente, então é null
            quoteVolume: '0',      // 'quoteVolume' ausente, então é '0'
            trades: 0,             // 'trades' ausente, então é 0
            baseAssetVolume: '0',  // 'baseAssetVolume' ausente, então é '0'
            quoteAssetVolume: '0', // 'quoteAssetVolume' ausente, então é '0'
        });
    });

    afterEach(() => {
        // Restaurar a implementação original do console.log
        jest.restoreAllMocks();
    });
});
