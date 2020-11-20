import BidAsk from './BidAsk';
import Market from './Market';

export default class Path {
  coin: string;
  markets: Market[] = [];

  constructor(coin: string) {
    this.coin = coin;
  }
  addMarket = (market: Market) => {
    this.markets.push(market);
    return this;
  };

  hasSymbol = (symbol: string) => {
    return this.markets.some((market: Market) => market.symbol == symbol);
  };

  calculate = (fee: number, bidAsk: Map<string, BidAsk>) => {
    let type: string = '';
    let price: number = 0;
    let start: number = 1;
    let coins: number = start;
    let current: string = this.coin;
    let str = '';
    this.markets.forEach((market: Market) => {
      let marketBidAsk = bidAsk.get(market.symbol);
      if (marketBidAsk == undefined) {
        coins = 0;
        return;
      }
      if (current == market.baseAsset) {
        type = 'sell';
        price = marketBidAsk.bid;
        coins = coins * price;
        current = market.quoteAsset;
      } else {
        type = 'buy';
        price = marketBidAsk.ask;
        coins = coins / price;
        current = market.baseAsset;
      }
      coins -= (coins / 100) * fee;
      str += `${type} ${market.symbol} @ ${price}\n`;
    });
    return {
      score: Math.round(((coins - start) / start) * 100000) / 1000,
      str: str.substring(0, str.length - 2)
    };
  };

  toString = () => {
    let str = '';
    this.markets.forEach((market: Market) => {
      str += market.symbol + ' ';
    });
    return str.substr(0, str.length - 1);
  };
}
