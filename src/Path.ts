import Action from './Action';
import Market from './Market';

function roundFloor(number: number, prec: number) {
  let tempnumber = number * Math.pow(10, prec);
  tempnumber = Math.floor(tempnumber);
  return tempnumber / Math.pow(10, prec);
}
// buy MBLUSDT 19.99977 USDT @ 0.00145400 = 13755 MBL
// sell MBLBNB 13753 MBL @ 0.00004850 = 0.6670205 BNB
// sell BNBUSDT 0.666 BNB @ 30.08470000 = 20.0364102 USDT
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
    let type = '';
    let current: string = this.coin;
    let price = 0;
    const actions: Action[] = [];
    let size = startAmount;
    let resultPreFee = 0;
    let string = '';
    let result = 0;
    let first = true;
    let cstr = '';
    let baseSize = 0;
    for (let i = 0; i < this.markets.length; i++) {
      const market = this.markets[i];
      const previous = current;
      cstr += `${current}->`;
      if (current === market.baseAsset) {
        type = 'sell';
        price = market.bid;
        size = roundFloor(size, market.lotPrecision);
        if (size > market.bidQuantity) {
          result = 0;
          break;
        }
        resultPreFee = roundFloor(size * price, market.quoteAssetPrecision);
        current = market.quoteAsset;
        string += `${market.symbol} ${type} ${market.baseAsset} ${size} @ ${price} total ${resultPreFee} ${current}\n`;
      } else {
        type = 'buy';
        price = market.ask;
        // string += ` >${size}:${market.askQuantity}< `;
        resultPreFee = roundFloor(size / price, market.lotPrecision);
        if (resultPreFee > market.askQuantity) {
          result = 0;
          // string += ` >${size}:${market.askQuantity}< `;
          // console.log(` ${baseSize} : ${market.askQuantity}`);
          break;
        }
        // ETHBUSD buy ETH 0.03453 @ 579.78000000 total 20.019803399999997 BUSD
        // LTCETH buy LTC 0.232 @ 0.14882000 total 0.03452624000000001 ETH
        // LTCBUSD sell LTC 0.232 @ 86.36000000 total 20.03552 BUSD
        // 0.0775224775224885
        // let realSize = size / price;

        // let xresultPreFee = roundFloor(size / price, market.baseAssetPrecision);
        current = market.baseAsset;
        string += `${market.symbol} ${type} ${market.baseAsset} ${resultPreFee} @ ${price} total ${
          resultPreFee * price
        } ${market.quoteAsset}\n`;
        size = resultPreFee;
      }

      result = resultPreFee - (resultPreFee / 100) * this.fee;

      // actions.push(
      //   new Action(
      //     market.symbol,
      //     market.baseAsset,
      //     market.quoteAsset,
      //     price,
      //     size,
      //     type,
      //     resultPreFee,
      //     result
      //   )
      // );
      size = result;
    }
    const score = ((result - startAmount) / startAmount) * 100;
    string += `${score}`;
    return {
      score,
      actions,
      string
    };
  };
}
