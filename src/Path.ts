import Action from './Action';
import Market from './Market';

export default class Path {
  coin: string;

  markets: Market[] = [];

  startCoins = 1;

  fee: number;

  constructor(coin: string, fee: number) {
    this.coin = coin;
    this.fee = fee;
  }

  addMarket = (market: Market) => {
    this.markets.push(market);
    return this;
  };

  // hasSymbol = (symbol: string) => {
  //   return this.markets.some((market: Market) => market.symbol == symbol);
  // };

  calculate = (): { score: number; actions: Action[] } => {
    let type = 'sell';
    let coins: number = this.startCoins;
    let current: string = this.coin;
    let price = 0;
    const actions: Action[] = [];
    this.markets.forEach((market: Market) => {
      if (current == market.baseAsset) {
        price = market.bid;
        coins *= price;
        current = market.quoteAsset;
      } else {
        type = 'buy';
        price = market.ask;
        coins /= price;
        current = market.baseAsset;
      }
      actions.push(new Action(market.symbol, price, coins, type));
      coins -= (coins / 100) * this.fee;
    });
    return {
      score: Math.round(((coins - this.startCoins) / this.startCoins) * 1000000) / 10000,
      actions
    };
  };

  // toString = () => {
  //   let str = '';
  //   this.markets.forEach((market: Market) => {
  //     str += `${market.symbol} `;
  //   });
  //   return str.substr(0, str.length - 1);
  // };
}
