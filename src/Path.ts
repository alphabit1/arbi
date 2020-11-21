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

  calculate = (fee: number) => {
    let type: string = '';
    let price: number = 0;
    let start: number = 1;
    let coins: number = start;
    let current: string = this.coin;
    let str = '';
    let actions: Action[] = [];
    this.markets.forEach((market: Market) => {
      if (current == market.baseAsset) {
        type = 'sell';
        price = market.bid;
        coins = coins * price;
        current = market.quoteAsset;
      } else {
        type = 'buy';
        price = market.ask;
        coins = coins / price;
        current = market.baseAsset;
      }
      let action: Action = {
        symbol: market.symbol,
        type,
        price,
        size: 0
      };
      actions.push(action);
      let coinsPreFee = coins;
      coins -= (coins / 100) * fee;
      str += `${type} ${market.symbol} @ ${price} ${coinsPreFee} ${coins}\n`;
    });
    return {
      score: Math.round(((coins - start) / start) * 1000000) / 10000,
      str: str.substring(0, str.length - 1),
      actions: actions
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
