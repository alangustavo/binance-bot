// src/services/BinanceService.ts
import Binance from 'binance-api-node';
import config from '../config';

class BinanceService {
    private binance: ReturnType<typeof Binance>;

    constructor() {
        this.binance = Binance({
            apiKey: config.binanceApiKey,
            apiSecret: config.binanceSecretKey,
        });
    }

    // Método para obter as variações de um par nas últimas 24 horas
    public async get24hTicker(symbol: string): Promise<any> {
        try {
            const tickerData = await this.binance.dailyStats({ symbol });
            return tickerData;
        } catch (error) {
            console.error('Error fetching 24h ticker data:', error);
            throw error;
        }
    }
}

export default new BinanceService();
