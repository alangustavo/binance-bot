// // src/index.ts
// import CandleStorage from './models/CandleStorage';
// import BinanceService from './services/BinanceService';

import 'dotenv/config';
import AccountService from "./services/AccountService";
import HistoricalCandlesService from './services/HistoricalCandlesService';

async function run() {
    const historicalCandle = new HistoricalCandlesService();
    const candles = await historicalCandle.getHistoricalCandles('SOLUSDT', '1m', 5);

}


run();
