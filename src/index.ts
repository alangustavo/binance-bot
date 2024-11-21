import 'dotenv/config';
import HistoricalCandlesService from './services/HistoricalCandlesService';
async function run() {
    const historicalCandle1 = new HistoricalCandlesService();
    const historicalCandle2 = new HistoricalCandlesService();

    // Função para buscar candles e exibir
    const fetchAndLogCandles = async () => {
        try {
            // Obtém candles com diferentes intervalos
            const candles = await historicalCandle1.getHistoricalCandles('SOLUSDT', '1m', 5);
            const candles2 = await historicalCandle2.getHistoricalCandles('SOLUSDT', '3m', 5);

            // Loga os resultados
            console.log("Candles 1m:", candles);
            console.log("Candles 3m:", candles2);
        } catch (error) {
            console.error("Erro ao buscar candles:", error);
        }
    };

    // Chama a função imediatamente
    await fetchAndLogCandles();

    // Executa a função a cada 30 segundos
    setInterval(fetchAndLogCandles, 30000);
}

// Chama a função `run`
run();
