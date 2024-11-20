// src/models/CandleStorage.ts
import Binance from 'binance-api-node';
import config from '../config';

type Candle = {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteVolume: string;
    trades: number;
    baseAssetVolume: string;
    quoteAssetVolume: string;
};

class CandleStorage {
    private candles: Candle[]; // Armazena candles para o par e intervalo
    private maxSize: number;
    private pair: string;
    private interval: string;
    private binanceClient: ReturnType<typeof Binance>;

    constructor(pair: string, interval: string, maxSize: number = 500) {
        this.candles = [];
        this.maxSize = maxSize;
        this.pair = pair;
        this.interval = interval;

        // Inicializa o cliente da Binance
        this.binanceClient = Binance({
            apiKey: config.binanceApiKey,
            apiSecret: config.binanceSecretKey,
        });

        // Inicializa os dados históricos e configura o WebSocket
        this.initialize();
    }

    // Método para inicializar candles históricos e configurar WebSocket
    private async initialize(): Promise<void> {
        // Obtenha dados históricos da Binance
        const historicalCandles = await this.binanceClient.candles(this.pair, this.interval);
        this.addCandles(historicalCandles.map(this.extractCandleData));

        // Aqui você deve configurar a assinatura do WebSocket
        this.setupWebSocket();
    }

    // Método para configurar WebSocket usando a biblioteca binance-api-node
    private setupWebSocket(): void {
        this.binanceClient.ws.candles(this.pair, this.interval, (candle) => {
            const newCandle = this.extractCandleData(candle);
            this.addCandle(newCandle);
        });
    }

    // Método para extrair os dados do candle
    private extractCandleData(kline: any): Candle {
        return {
            openTime: kline.openTime,
            open: kline.open,
            high: kline.high,
            low: kline.low,
            close: kline.close,
            volume: kline.volume,
            closeTime: kline.closeTime,
            quoteVolume: kline.quoteVolume,
            trades: kline.trades,
            baseAssetVolume: kline.baseAssetVolume,
            quoteAssetVolume: kline.quoteAssetVolume
        };
    }

    // Método para adicionar um candle
    public addCandle(newCandle: Candle): void {
        this.candles.push(newCandle);

        // Verifica se o tamanho do array excede o máximo permitido
        if (this.candles.length > this.maxSize) {
            // Remove o candle mais antigo
            this.candles.shift();
        }
    }

    // Método para adicionar múltiplos candles
    public addCandles(newCandles: Candle[]): void {
        newCandles.forEach(candle => this.addCandle(candle));
    }

    // Método para obter todos os candles
    public getAllCandles(): Candle[] {
        return this.candles;
    }

    // Métodos de acesso (similar aos anteriores)
    public getClosePrices(): string[] {
        return this.candles.map(candle => candle.close);
    }

    public getLastClosePrices(count: number): string[] {
        return this.candles.slice(-count).map(candle => candle.close);
    }

    // Adicione mais métodos conforme necessário
}

export default CandleStorage;
