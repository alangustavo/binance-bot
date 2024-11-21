import RealTimeCandlesService from '../src/services/RealTimeCandlesService';
import HistoricalCandlesService from '../src/services/HistoricalCandlesService';
import BinanceClient from '../src/services/BinanceClient';
import { Binance, CandleChartInterval_LT } from 'binance-api-node';

// Mock da biblioteca binance-api-node
jest.mock('../src/services/BinanceClient');

describe('RealTimeCandlesService', () => {
    let historicalCandlesService: HistoricalCandlesService;
    let realTimeCandlesService: RealTimeCandlesService;

    const mockSymbol = 'BTCUSDT';
    const mockInterval: CandleChartInterval_LT = '1m';

    beforeEach(() => {
        // Mock do HistoricalCandlesService
        historicalCandlesService = {
            updateCandle: jest.fn(),
            getStoredCandles: jest.fn(),
            getHistoricalCandles: jest.fn(),
        } as unknown as HistoricalCandlesService;

        // Mock do WebSocket para o cliente Binance
        const mockWsCandles = jest.fn((symbol, interval, callback) => {
            // Simula uma atualização de candle recebida do WebSocket
            const mockCandle = {
                startTime: Date.now(),
                open: '10000',
                high: '10500',
                low: '9500',
                close: '10200',
                volume: '10',
                closeTime: Date.now() + 60000,
            };
            callback(mockCandle);
        });

        // Mock do cliente Binance
        const mockClient = {
            ws: {
                candles: mockWsCandles,
            },
        } as unknown as Binance;

        // Mock da instância Singleton de BinanceClient
        const mockBinanceClientInstance = {
            getClient: jest.fn().mockReturnValue(mockClient),
        };

        // Substitui o retorno de getInstance para retornar o mock
        (BinanceClient.getInstance as jest.Mock).mockReturnValue(mockBinanceClientInstance);

        // Instancia o RealTimeCandlesService
        realTimeCandlesService = new RealTimeCandlesService(
            mockSymbol,
            mockInterval,
            historicalCandlesService,
        );
    });

    it('should initialize the WebSocket for the given symbol and interval', () => {
        const mockClient = BinanceClient.getInstance().getClient();
        expect(mockClient.ws.candles).toHaveBeenCalledWith(
            mockSymbol,
            mockInterval,
            expect.any(Function),
        );
    });

    it('should call updateCandle on HistoricalCandlesService when a candle update is received', () => {
        // Verifica se o updateCandle foi chamado
        expect(historicalCandlesService.updateCandle).toHaveBeenCalledWith(
            expect.objectContaining({
                startTime: expect.any(Number),
                open: '10000',
                high: '10500',
                low: '9500',
                close: '10200',
                volume: '10',
                closeTime: expect.any(Number),
            }),
        );
    });


});
