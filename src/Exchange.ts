import binance from 'binance';
import Market from './Market';

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
      key: '',
      secret: '',
      disableBeautification: false,
      handleDrift: true
    });
    this.ws = new binance.BinanceWS();
  }

  startWs = (tickerCallback: any) => {
    this.websocket = this.ws.onAllTickers((data: any) => {
      tickerCallback(data);
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
}
export default Exchange;
