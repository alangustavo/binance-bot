// ./src/services/HistoricalCandlesService.ts
import BinanceClient from './BinanceClient';
import { CandleChartInterval_LT } from 'binance-api-node';
import RealTimeCandlesService from './RealTimeCandlesService';

class HistoricalCandlesService {
    private client = BinanceClient.getInstance().getClient();
    private symbol: string = '';
    private interval: CandleChartInterval_LT = '1m';
    private historicalCandles: any[] = [];
    private limit: number = 24; // Padrão inicial de 24, mas pode ser atualizado dinamicamente
    private realTimeCandlesService: RealTimeCandlesService | null = null;

    public async getHistoricalCandles(symbol: string, interval: CandleChartInterval_LT, limit: number) {
        this.limit = limit; // Atualiza o limite baseado no número de candles solicitados
        this.symbol = symbol;
        this.interval = interval;
        try {
            const candles = await this.client.candles({ symbol, interval, limit });
            this.historicalCandles = candles;
            // Inicia o RealTimeCandlesService com os mesmos parâmetros
            this.realTimeCandlesService = new RealTimeCandlesService(symbol, interval, this);

            return this.historicalCandles;
        } catch (error) {
            console.error(`Error fetching historical candles for ${symbol}:`, error);
            throw error;
        }
    }

    public getStoredCandles() {
        return this.historicalCandles;
    }

    public updateCandle(candle: any) {
        const transformedCandle = this.transformCandle(candle);
        const lastCandle = this.historicalCandles[this.historicalCandles.length - 1];
        if (lastCandle && lastCandle.openTime === transformedCandle.openTime) {
            // Atualizar o último candle se ainda estiver aberto
            this.historicalCandles[this.historicalCandles.length - 1] = transformedCandle;
        } else {
            // Adicionar novo candle quando o último for fechado
            this.historicalCandles.push(transformedCandle);

            // Manter apenas os últimos 'limit' candles
            if (this.historicalCandles.length > this.limit) {
                this.historicalCandles.shift();
            }
            // console.log(`Historical Candle for ${this.symbol} ${this.interval}:`, transformedCandle);


        }

    }

    public log() {
        console.log(`Historical Candle for ${this.symbol} ${this.interval}:`, this.historicalCandles);
    }
    private transformCandle(candle: any) {
        return {
            openTime: candle.startTime || null,
            open: candle.open || '0',
            high: candle.high || '0',
            low: candle.low || '0',
            close: candle.close || '0',
            volume: candle.volume || '0',
            closeTime: candle.closeTime || null,
            quoteVolume: candle.quoteVolume || '0',
            trades: candle.trades || 0,
            baseAssetVolume: candle.baseAssetVolume || '0',
            quoteAssetVolume: candle.quoteAssetVolume || '0',
        };
    }

}

export default HistoricalCandlesService;


