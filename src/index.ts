// src/index.ts
import BinanceService from './services/BinanceService';

async function run() {
    const symbol = 'SOLUSDT';  // Aqui você pode especificar o par de moedas

    console.log(`Fetching 24h ticker data for ${symbol}...`);

    try {
        const tickerData = await BinanceService.get24hTicker(symbol);
        console.log('24h Ticker Data:', tickerData);
    } catch (error) {
        console.error('Failed to fetch ticker data:', error);
    }
}

run();
