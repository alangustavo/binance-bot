// ./src/services/RealTimeCandlesService.ts
import BinanceClient from './BinanceClient';
import { CandleChartInterval_LT } from 'binance-api-node';
import HistoricalCandlesService from './HistoricalCandlesService';

class RealTimeCandlesService {
    private client = BinanceClient.getInstance().getClient();
    private symbol: string;
    private interval: CandleChartInterval_LT;
    private historicalCandlesService: HistoricalCandlesService;

    constructor(symbol: string, interval: CandleChartInterval_LT, historicalCandlesService: HistoricalCandlesService) {
        this.symbol = symbol;
        this.interval = interval;
        this.historicalCandlesService = historicalCandlesService;
        this.initializeWebSocket();
    }

    private initializeWebSocket() {
        this.client.ws.candles(this.symbol, this.interval, (candle) => {
            // console.log(`Received candle update for ${this.symbol} ${this.interval}:`, candle);
            this.historicalCandlesService.updateCandle(candle);
        });
    }
}

export default RealTimeCandlesService;
