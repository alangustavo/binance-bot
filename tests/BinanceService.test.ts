// tests/BinanceService.test.ts
import BinanceService from '../src/services/BinanceService';

describe('BinanceService', () => {
    const mockSymbol = 'BTCUSDT';

    it('should fetch 24h ticker data for a given symbol', async () => {
        const mockTickerData = {
            symbol: mockSymbol,
            priceChange: '100.00',
            priceChangePercent: '5.23',
            weightedAvgPrice: '20000.00',
            prevClosePrice: '19500.00',
            lastPrice: '20500.00',
            lastQty: '0.001',
            bidPrice: '20490.00',
            bidQty: '1.5',
            askPrice: '20510.00',
            askQty: '0.5',
            openPrice: '19500.00',
            highPrice: '21000.00',
            lowPrice: '19000.00',
            volume: '1500',
            quoteVolume: '30000000.00',
            openTime: Date.now() - 86400000,
            closeTime: Date.now(),
            firstId: 1,
            lastId: 1000,
            count: 1000
        };

        jest.spyOn(BinanceService['binance'], 'dailyStats').mockResolvedValue(mockTickerData);

        const tickerData = await BinanceService.get24hTicker(mockSymbol);

        expect(tickerData).toEqual(mockTickerData);
        expect(tickerData.symbol).toBe(mockSymbol);
        expect(tickerData.priceChangePercent).toBe('5.23');
    });

    it('should handle errors when fetching ticker data', async () => {
        jest.spyOn(BinanceService['binance'], 'dailyStats').mockRejectedValue(new Error('API Error'));

        await expect(BinanceService.get24hTicker(mockSymbol)).rejects.toThrow('API Error');
    });
});
