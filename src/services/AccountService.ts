// ./src/services/AccountService.ts
import BinanceClient from './BinanceClient';

class AccountService {
    private client = BinanceClient.getInstance().getClient();

    public async getAccountInfo() {
        try {
            const accountInfo = await this.client.accountInfo();
            if (!accountInfo || !accountInfo.balances) {
                throw new Error('Balances not found in account information');
            }
            const filteredBalances = accountInfo.balances.filter(
                (balance) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
            );
            return {
                ...accountInfo,
                balances: filteredBalances,
            };
        } catch (error) {
            console.error('Error fetching account information:', error);
            throw error;
        }
    }
}

export default new AccountService();
