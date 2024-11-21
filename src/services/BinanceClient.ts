// ./src/services/BinanceClient.ts
import Binance from 'binance-api-node';
import 'dotenv/config';

class BinanceClient {
    private static instance: BinanceClient;
    private client: ReturnType<typeof Binance>;

    private constructor() {
        this.client = Binance({
            apiKey: process.env.BINANCE_API_KEY,
            apiSecret: process.env.BINANCE_SECRET_KEY,
        });
    }

    public static getInstance(): BinanceClient {
        if (!BinanceClient.instance) {
            BinanceClient.instance = new BinanceClient();
        }
        return BinanceClient.instance;
    }

    public getClient(): ReturnType<typeof Binance> {
        return this.client;
    }
}

export default BinanceClient;
