import { Observable, Subject } from 'threads/observable';
import { spawn, Thread, Worker } from 'threads';
import Spinnies from 'spinnies';
import Exchange from './Exchange';
import Market from './Market';
import Path from './Path';
import PathFinder from './PathFinder';
import Action from './Action';
import Arb from './Arb';

export default class Arbi {
  baseCoins: string[] = [];

  fee = 0.075;

  perc = 0;

  threshold = 0;

  score = 0;

  penta: boolean;

  square: boolean;

  triangle: boolean;

  coinWorkers: Map<string, any> = new Map();

  arbs: Arb[] = [];
  //   ✖ 0.15min - 3 - 0.6733622750000339
  // buy ADAEUR 16.86844799 EUR @ 0.12664000 = 133.19999992 ADA
  // sell ADABUSD 133.3 ADA @ 0.15005000 = 20.001665 BUSD
  // buy EURBUSD 20.012881 BUSD @ 1.18630000 = 16.87 EUR
  // 0.1000000000000049
  results: Map<
    string,
    {
      score: number;
      arbs: number;
      markets: number;
      paths: number;
      startAmount: number;
    }
  > = new Map();

  arbTypes: Map<number, string> = new Map([
    [23, 'triangle'],
    [24, 'square'],
    [25, 'penta']
  ]);

  constructor(baseCoins: string[], fee: number, triangle = true, square = true, penta = true) {
    this.baseCoins = baseCoins;
    this.fee = fee;
    this.triangle = triangle;
    this.square = square;
    this.penta = penta;
  }

  getCoinAmountFromUsd = async (
    markets: Map<string, Market>,
    coin: string,
    usd: number
  ): Promise<number> => {
    if (coin == 'USDT') return +usd.toFixed(2);

    const market = markets.get(`${coin}USDT`);
    if (market == undefined) return +usd.toPrecision(2);
    return +(usd / market.bid).toFixed(market.lotPrecision);
  };

  start = async () => {
    const totalTime = new Date().getTime();
    const spinnies = new Spinnies();
    const exchange = new Exchange();
    const markets = await exchange.getMarkets();

    for (let i = 0; i < this.baseCoins.length; i++) {
      const startCoin: string = this.baseCoins[i];
      spinnies.add(startCoin, { text: startCoin });
    }

    spinnies.add('last', { text: 'last', spinner: ['-'] });
    for (let i = 0; i < this.baseCoins.length; i++) {
      const startCoin: string = this.baseCoins[i];
      const exchange = new Exchange();
      let startAmount = await this.getCoinAmountFromUsd(markets, startCoin, 20);
      if (startAmount == undefined) {
        startAmount = +(20).toPrecision(8);
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        const arbiWorker = await spawn(new Worker('./workers/arbiWorker'));
        arbiWorker.start(
          startCoin,
          startAmount,
          this.threshold,
          this.fee,
          this.triangle,
          this.square,
          this.penta
        );
        arbiWorker.values().subscribe(({ coin, code, data }) => {
          let res = this.results.get(coin);
          if (res == undefined) {
            res = { score: 0, arbs: 0, markets: 0, paths: 0, startAmount: 0 };
          }
          res.startAmount = startAmount;
          switch (code) {
            case 1:
              res.markets = data;
              this.results.set(coin, res);
              spinnies.update(coin, { text: `${coin} active markets: ${data}` });
              break;
            case 23:
              res.paths += data;
              this.results.set(coin, res);
              spinnies.update(coin, { text: `${coin} triangle arbs: ${data}` });
              break;
            case 24:
              res.paths += data;
              this.results.set(coin, res);
              spinnies.update(coin, { text: `${coin} square arbs: ${data}` });
              break;
            case 25:
              res.paths += data;
              this.results.set(coin, res);
              spinnies.update(coin, { text: `${coin} penta arbs: ${data}` });
              break;
            case 3:
              let txt = `${coin} `;
              if (coin.length == 3) {
                txt += ' ';
              }
              txt += `${res.startAmount} ${data}s paths: ${res.paths}`;
              let fill = 35 - txt.length;
              for (let i = 0; i < fill; i++) {
                txt += ' ';
              }
              txt += `arbs: ${res.arbs}`;
              fill = 60 - txt.length;
              for (let i = 0; i < fill; i++) {
                txt += ' ';
              }
              spinnies.update(coin, {
                text: `${txt}  perc: ${Math.round(res.score * 100) / 100}  `
              });
              break;
            case 666:
              const arb = new Arb(coin, data.score, data.actions, data.string);
              // TODO: purely for dev purposes when not executing the trade to not skew results by counting the same arb multiple times
              let skip = false;
              const same = this.arbs.filter((arbOld: Arb) => arb.hash() === arbOld.hash());
              same.forEach((sameArb: Arb) => {
                if (
                  arb.timestamp - sameArb.timestamp < 100000 &&
                  Math.abs(sameArb.score - arb.score) < 0.1
                ) {
                  skip = true;
                }
              });
              const time = new Date().getTime() - totalTime;
              if (!skip) {
                this.arbs.push(arb);
                res.score += arb.score;
                this.score += arb.score;
                res.arbs++;
                this.results.set(coin, res);

                spinnies.succeed('last', {
                  text: `${Math.round(time / 10 / 60) / 100}min - ${this.arbs.length} - ${
                    this.score
                  }\n${data.string}`
                });
              } else {
                spinnies.fail('last', {
                  text: `${Math.round(time / 10 / 60) / 100}min - ${this.arbs.length} - ${
                    this.score
                  }\n${data.string}`
                });
              }
              break;
            case 3:
              console.log();
              break;
            default:
              break;
          }
        });
        this.coinWorkers.set(startCoin, arbiWorker);
      } catch (e) {
        console.log(e);
      }
    }
  };

  stop = (coin: string) => {
    this.coinWorkers.get(coin)?.finish();
  };
}
