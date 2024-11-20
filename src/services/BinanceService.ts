// src/services/BinanceService.ts
import Binance, { CandleChartInterval_LT } from 'binance-api-node';
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

    // Método para obter os últimos candles para um par de moedas específico
    public async getRecentCandles(symbol: string, interval: CandleChartInterval_LT = '1h', limit: number = 500): Promise<any> {
        try {
            // A chamada correta do método candles com dois argumentos
            const candles = await this.binance.candles(symbol, interval);
            // Filtrando os últimos 'limit' candles, caso seja necessário
            return candles.slice(-limit); // Retorna apenas os últimos 'limit' candles
        } catch (error) {
            console.error(`Error fetching candles data for ${symbol}:`, error);
            throw error;
        }
    }
}

export default new BinanceService();
