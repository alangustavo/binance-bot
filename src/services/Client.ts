import Binance from "binance-api-node";
require("dotenv").config();

let clientOptions = {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.SECRET_KEY,
};

const client = Binance(clientOptions);

export default client;
