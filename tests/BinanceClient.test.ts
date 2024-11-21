// ./tests/BinanceClient.test.ts
import BinanceClient from '../src/services/BinanceClient';

describe('BinanceClient', () => {
    it('should create only one instance of BinanceClient', () => {
        const instance1 = BinanceClient.getInstance();
        const instance2 = BinanceClient.getInstance();

        expect(instance1).toBe(instance2);
    });

    it('should return a client instance', () => {
        const clientInstance = BinanceClient.getInstance().getClient();

        expect(clientInstance).toBeDefined();
    });
});
