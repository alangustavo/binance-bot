// ./tests/AccountService.test.ts
import AccountService from '../src/services/AccountService';
import BinanceClient from '../src/services/BinanceClient';

const mockAccountInfoResolved = {
    makerCommission: 10,
    takerCommission: 10,
    buyerCommission: 0,
    sellerCommission: 0,
    commissionRates: {
        maker: '0.00100000',
        taker: '0.00100000',
        buyer: '0.00000000',
        seller: '0.00000000'
    },
    canTrade: true,
    canWithdraw: true,
    canDeposit: true,
    brokered: false,
    requireSelfTradePrevention: false,
    preventSor: false,
    updateTime: 1727172001558,
    accountType: 'SPOT',
    balances: [
        { asset: 'BTC', free: '0.00001000', locked: '0.00000000' },
        { asset: 'BNB', free: '0.00000106', locked: '0.00000000' },
        { asset: 'USDT', free: '0.58843884', locked: '0.00000000' },
        { asset: 'TUSD', free: '0.18503572', locked: '0.00000000' },
        { asset: 'UNI', free: '0.01200000', locked: '0.00000000' },
        { asset: 'LDSOL', free: '11.18039748', locked: '0.00000000' }
    ],
    permissions: ['SPOT'],
    uid: 1234567
};

const mockAccountInfoNoBalances = {
    makerCommission: 10,
    takerCommission: 10,
    buyerCommission: 0,
    sellerCommission: 0,
    commissionRates: {
        maker: '0.00100000',
        taker: '0.00100000',
        buyer: '0.00000000',
        seller: '0.00000000'
    },
    canTrade: true,
    canWithdraw: true,
    canDeposit: true,
    brokered: false,
    requireSelfTradePrevention: false,
    preventSor: false,
    updateTime: 1727172001558,
    accountType: 'SPOT',
    permissions: ['SPOT'],
    uid: 1234567
};

const mockAccountInfoWithUnfilteredBalances = {
    ...mockAccountInfoResolved,
    balances: [
        { asset: 'BTC', free: '0.00001000', locked: '0.00000000' },
        { asset: 'BNB', free: '0.00000106', locked: '0.00000000' },
        { asset: 'USDT', free: '0.58843884', locked: '0.00000000' },
        { asset: 'TUSD', free: '0.18503572', locked: '0.00000000' },
        { asset: 'UNI', free: '0.01200000', locked: '0.00000000' },
        { asset: 'ABC', free: '0.00000000', locked: '0.00000000' }, // Saldo extra com free e locked igual a 0
        { asset: 'XYZ', free: '0.00000000', locked: '0.00000000' }, // Saldo extra com free e locked igual a 0
        { asset: 'LDSOL', free: '11.18039748', locked: '0.00000000' }

    ]
};

jest.mock('../src/services/BinanceClient', () => {
    const originalModule = jest.requireActual('../src/services/BinanceClient');
    return {
        ...originalModule,
        getInstance: jest.fn().mockReturnValue({
            getClient: jest.fn().mockReturnValue({
                accountInfo: jest.fn()
            })
        })
    };
});

describe('AccountService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and filter account information', async () => {
        const mockAccountInfo = BinanceClient.getInstance().getClient().accountInfo as jest.Mock;
        mockAccountInfo.mockResolvedValue(mockAccountInfoWithUnfilteredBalances);

        const accountInfo = await AccountService.getAccountInfo();
        expect(accountInfo).toBeDefined();
        expect(accountInfo.balances).toBeDefined();
        expect(accountInfo.balances.length).toBe(6); // Deve filtrar para 6 saldos, removendo XYZ
        accountInfo.balances.forEach(balance => {
            expect(parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0).toBe(true);
        });
    });

    it('should handle missing balances in account information', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const mockAccountInfo = BinanceClient.getInstance().getClient().accountInfo as jest.Mock;
        mockAccountInfo.mockResolvedValue(mockAccountInfoNoBalances);

        await expect(AccountService.getAccountInfo()).rejects.toThrow('Balances not found in account information');
        expect(console.error).toHaveBeenCalledWith('Error fetching account information:', expect.any(Error));

        console.error = originalConsoleError;
    });

    it('should handle errors when fetching account information', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const mockAccountInfo = BinanceClient.getInstance().getClient().accountInfo as jest.Mock;
        mockAccountInfo.mockRejectedValue(new Error('API error'));

        await expect(AccountService.getAccountInfo()).rejects.toThrow('API error');
        expect(console.error).toHaveBeenCalledWith('Error fetching account information:', expect.any(Error));

        console.error = originalConsoleError;
    });
});
