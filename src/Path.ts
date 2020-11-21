import Market from './Market';

interface Action {
  symbol: string;
  price: number;
  size: number;
  type: string;
}

export default class Path {
  coin: string;
  markets: Market[] = [];
  startCoins = 1;

  constructor(coin: string) {
    this.coin = coin;
  }
  hash = () => {
    let newHash = '';
    this.markets.forEach((market: Market) => {
      newHash += market.hash();
    });
    return newHash;
  };

  addMarket = (market: Market) => {
    this.markets.push(market);
    return this;
  };

  hasSymbol = (symbol: string) => {
    return this.markets.some((market: Market) => market.symbol == symbol);
  };

  calculate = (fee: number) => {
    let type: string = 'sell';
    let coins: number = this.startCoins;
    let current: string = this.coin;
    let price = 0;
    this.markets.forEach((market: Market) => {
      if (current == market.baseAsset) {
        price = market.bid;
        coins = coins * price;
        current = market.quoteAsset;
      } else {
        type = 'buy';
        price = market.ask;
        coins = coins / price;
        current = market.baseAsset;
      }
      coins -= (coins / 100) * fee;
    });
    return Math.round(((coins - this.startCoins) / this.startCoins) * 1000000) / 10000;
  };

  toString = () => {
    let str = '';
    this.markets.forEach((market: Market) => {
      str += market.symbol + ' ';
    });
    return str.substr(0, str.length - 1);
  };
}
