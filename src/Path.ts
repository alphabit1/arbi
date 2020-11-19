import BidAsk from './BidAsk';
import { Pair } from './Exchange';

export default class Path {
  coin: string;
  pairs: Pair[] = [];

  constructor(coin: string) {
    this.coin = coin;
  }
  addPair = (pair: Pair) => {
    this.pairs.push(pair);
    return this;
  };

  hasSymbol = (symbol: string) => {
    return this.pairs.some((pair: Pair) => pair.symbol == symbol);
  };

  calculate = (fee: number, bidAsk: Map<string, BidAsk>) => {
    let type: string = '';
    let price: number = 0;
    let start: number = 1;
    let coins: number = start;
    let current: string = this.coin;
    let str = '';
    this.pairs.forEach((pair: Pair) => {
      let pairBidAsk = bidAsk.get(pair.symbol);
      if (pairBidAsk == undefined) {
        // console.log(`${pair.symbol} has no BidAsk`);
        coins = 0;
        return;
      }
      if (current == pair.baseAsset) {
        type = 'sell';
        price = pairBidAsk.bid;
        coins = coins * price;
        current = pair.quoteAsset;
      } else {
        type = 'buy';
        price = pairBidAsk.ask;
        coins = coins / price;
        current = pair.baseAsset;
      }
      coins -= (coins / 100) * fee;
      str += `${type} ${pair.symbol} @ ${price}\n`;
    });
    return {
      score: Math.round(((coins - start) / start) * 100000) / 1000,
      str: str.substring(0, str.length - 2)
    };
  };

  toString = () => {
    let str = '';
    this.pairs.forEach((pair: Pair) => {
      str += pair.symbol + ' ';
    });
    return str.substr(0, str.length - 1);
  };
}
