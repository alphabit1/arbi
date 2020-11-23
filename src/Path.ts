import Action from './Action';
import Market from './Market';

function roundFloor(number: number, prec: number) {
  let tempnumber = number * Math.pow(10, prec);
  tempnumber = Math.floor(tempnumber);
  return tempnumber / Math.pow(10, prec);
}
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

  calculate = (startBalance: number): { score: number; string: string; profit: number } => {
    let current: string = this.coin;
    let balance: number = startBalance;
    let string = '';
    for (let i = 0; i < this.markets.length; i += 1) {
      const market = this.markets[i];
      const trade = {
        type: '',
        price: 0,
        size: 0,
        total: 0,
        liquidity: 0,
        fee: 0,
        symbol: market.symbol,
        base: market.baseCommissionPrecision,
        quote: market.quotePrecision
      };

      if (current === market.baseAsset) {
        trade.type = 'sell';
        trade.price = market.bid;
        trade.size = roundFloor(balance, market.lotPrecision);
        trade.liquidity = market.bidQuantity;
        trade.total = +(trade.size * trade.price).toFixed(market.quoteAssetPrecision);
        trade.fee = +((trade.total / 100) * this.fee).toFixed(market.quoteCommissionPrecision);

        balance = +(trade.total - trade.fee).toFixed(market.quotePrecision);
        current = market.quoteAsset;
      } else {
        trade.type = 'buy';
        trade.price = market.ask;
        trade.size = roundFloor(balance / trade.price, market.lotPrecision);
        trade.liquidity = market.askQuantity;
        trade.total = +(trade.size * trade.price).toFixed(market.baseAssetPrecision);
        trade.fee = +((trade.size / 100) * this.fee).toFixed(market.baseCommissionPrecision);
        balance = +(trade.size - trade.fee).toFixed(market.baseAssetPrecision);
        current = market.baseAsset;
        if (i === 0) {
          startBalance = trade.total;
        }
      }
      if (trade.size > trade.liquidity) {
        balance = 0;
        break;
      }
      string += `${market.symbol} ${trade.type} ${trade.size} ${market.baseAsset} @ ${trade.price} total ${trade.total} ${market.quoteAsset}\n`;
    }

    const score = ((balance - startBalance) / startBalance) * 100;
    string += `start with ${startBalance} end with ${balance} = ${score}%`;
    return {
      score,
      string,
      profit: balance - startBalance
    };
  };
}
