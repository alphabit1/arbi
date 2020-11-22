import Action from './Action';
import Market from './Market';

function roundFloor(number: number, prec: number) {
  var tempnumber = number * Math.pow(10, prec);
  tempnumber = Math.floor(tempnumber);
  return tempnumber / Math.pow(10, prec);
}

export default class Path {
  coin: string;

  markets: Market[] = [];

  startCoins = 1;

  fee: number;
  // ✖ 0.18min - 6 - 1.199076103500692
  // sell BNBBUSD 0.657 BNB @ 30.45930000 = 20.0117601 BUSD
  // buy HARDBUSD 40.42375539 HARD @ 0.49500000 = 20.00975892 BUSD
  // buy HARDBNB 0.65843712 HARD @ 0.01629000 = 40.419713009999995 BNB
  // 0.2087184170471803
  constructor(coin: string, fee: number) {
    this.coin = coin;
    this.fee = fee;
  }

  addMarket = (market: Market) => {
    this.markets.push(market);
    return this;
  };

  //   sell TRXNGN 680.97 TRX @ 14.25000000 = 9703.82 NGN
  // buy BNBNGN 0.651 BNB @ 14899.00000000 = 9702.85 NGN
  // buy TRXBNB 1042 TRX @ 0.00095980 = 1 BNB
  // //
  calculate = (startAmount: number): { score: number; actions: Action[]; string: string } => {
    let type = 'sell';
    let coins: number = startAmount;
    let current: string = this.coin;
    let price = 0;
    const actions: Action[] = [];
    let tradeCoins = coins;
    let coinsPreFee = 0;
    let string = '';
    this.markets.forEach((market: Market) => {
      coins = roundFloor(coins, market.lotPrecision);
      tradeCoins = coins;
      if (current == market.baseAsset) {
        price = market.bid;
        coins = roundFloor(coins * price, market.lotPrecision);
        current = market.quoteAsset;
      } else {
        type = 'buy';
        price = market.ask;
        coins = roundFloor(coins / price, market.lotPrecision);
        current = market.baseAsset;
      }
      coinsPreFee = coins;
      coins = roundFloor(coins - (coins / 100) * this.fee, market.lotPrecision);

      actions.push(
        new Action(
          market.symbol,
          market.baseAsset,
          market.quoteAsset,
          price,
          tradeCoins,
          type,
          coinsPreFee,
          coins
        )
      );
    });
    return {
      score: ((coins - startAmount) / startAmount) * 100,
      actions,
      string
    };
  };
}
