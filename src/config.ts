import dotenv from 'dotenv';
dotenv.config();
// src/config.ts
export default {
    binanceApiKey: process.env.BINANCE_API_KEY || '',
    binanceSecretKey: process.env.BINANCE_SECRET_KEY || ''
};
