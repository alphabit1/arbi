import binance from 'binance';
import Market from './Market';
import Trade from './Trade';

const pairs = [
  {
    symbol: 'ETHBTC',
    status: 'TRADING',
    baseAsset: 'ETH',
    quoteAsset: 'BTC'
  },
  {
    symbol: 'BNBBTC',
    status: 'TRADING',
    baseAsset: 'BNB',
    quoteAsset: 'BTC'
  },
  {
    symbol: 'BNBETH',
    status: 'TRADING',
    baseAsset: 'BNB',
    quoteAsset: 'ETH'
  },
  {
    symbol: 'LTCBNB',
    status: 'TRADING',
    baseAsset: 'LTC',
    quoteAsset: 'BNB'
  },
  {
    symbol: 'LTCBTC',
    status: 'TRADING',
    baseAsset: 'LTC',
    quoteAsset: 'BTC'
  },
  {
    symbol: 'XTCBTC',
    status: 'TRADING',
    baseAsset: 'XTC',
    quoteAsset: 'BTC'
  }
];

class Exchange {
  websocket: any = null;

  rest: any;

  ws: any;

  constructor() {
    this.rest = new binance.BinanceRest({
      key: 'oUqVXgObtIf68wZPWhC7UlJr8ckMEcBSE0OfiWfCtspdHl52SuF3wNiYVX9xCNQD',
      secret: 'gmFOR19YgcKaMqqpOVnpbOaJjcTQmNu1IiyNiihpOMqxMa1bZZUeQJwU6M6Ljc1X',
      disableBeautification: false
      // handleDrift: true
    });
    this.ws = new binance.BinanceWS();
  }

  startWs = (tickerCallback: any) => {
    this.websocket = this.ws.onAllTickers((data: any) => {
      tickerCallback(data);
    });
  };

  startUserWs = (callback: any) => {
    this.websocket = this.ws.onUserData(this.rest, (data: any) => {
      callback(data);
    });
  };

  getAllSymbols = async (dev = false) => {
    if (dev) return pairs;
    return (await this.rest.exchangeInfo()).symbols.filter((d: any) => {
      return d.status === 'TRADING';
    });
  };

  getAllBookTickersMap = async (): Promise<Map<string, any>> => {
    const bidAsks: Map<string, any> = new Map();
    const tickers = await this.rest.allBookTickers();
    tickers.forEach((ticker: any) => {
      bidAsks.set(ticker.symbol, ticker);
    });
    return bidAsks;
  };

  getMarkets = async (dev = false): Promise<Map<string, Market>> => {
    const markets: Map<string, Market> = new Map();
    const symbols = await this.getAllSymbols(dev);
    const tickers: Map<string, any> = await this.getAllBookTickersMap();
    symbols.forEach(async (market: any) => {
      const ticker = tickers.get(market.symbol);

      if (ticker) markets.set(market.symbol, new Market(market, ticker));
    });
    return markets;
  };

  usdToCoin = (markets: Map<string, Market>, coin: string, usd: number) => {
    if (coin == 'USDT') return +usd.toFixed(2);

    const market = markets.get(`${coin}USDT`);
    if (market == undefined) return +usd.toPrecision(2);
    return +(usd / market.bid).toFixed(market.lotPrecision);
  };

  coinToUsd = (markets: Map<string, Market>, coin: string, amount: number) => {
    if (coin === 'USDT') return +amount.toFixed(2);
    const market = markets.get(`${coin}USDT`);
    if (market === undefined) return +amount.toPrecision(2);
    return +(amount * market.bid).toFixed(market.lotPrecision);
  };

  roundLot = (markets: Map<string, Market>, coin: string, amount: number) => {
    if (coin === 'USDT') return +amount.toFixed(2);
    const market = markets.get(`${coin}USDT`);
    if (market === undefined) return +amount.toPrecision(2);
    return +amount.toFixed(market.lotPrecision);
  };

  order = async (trade: Trade) => {
    return this.rest.newOrder({
      symbol: trade.symbol,
      side: trade.type,
      type: 'LIMIT',
      quantity: trade.size,
      price: trade.price,
      timeInForce: 'GTC'
    });
  };
}
export default Exchange;
