import { Observable, Subject } from 'threads/observable';
import { spawn, Thread, Worker } from 'threads';
import Exchange from './Exchange';
import Market from './Market';
import Path from './Path';
import PathFinder from './PathFinder';
import Action from './Action';
import Arb from './Arb';

export default class Arbi {
  baseCoins: string[] = ['BTC', 'BNB', 'LTC', 'ETH', 'USDT', 'BUSD'];

  fee = 0.075;

  penta: boolean;

  square: boolean;

  triangle: boolean;

  coinWorkers: Map<string, any> = new Map();

  arbs: Arb[] = [];

  results: Map<string, { score: number; arbs: number }> = new Map();

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

  start = async () => {
    for (let i = 0; i < this.baseCoins.length; i++) {
      const startCoin: string = this.baseCoins[i];
      // find all arb paths
      // console.log(`Finding arb paths for: ${coin}`);

      try {
        // eslint-disable-next-line no-await-in-loop
        const arbiWorker = await spawn(new Worker('./workers/arbiWorker'));
        arbiWorker.start(startCoin, this.fee, this.triangle, this.square, this.penta);
        arbiWorker.values().subscribe(({ coin, code, data }) => {
          switch (code) {
            case 1:
              console.log(`${coin} active markets: ${data}`);
              break;
            case 23:
            case 24:
            case 25:
              console.log(`${coin} ${this.arbTypes.get(code)} arbs: ${data}`);
              break;
            case 3:
              console.log(`${coin} updated: ${data}s`);
              break;
            case 666:
              const arb = new Arb(coin, data.score, data.actions);
              // TODO purely for dev purposes when not executing the trade to not skew results by counting the same arb multiple times
              let skip = false;
              const same = this.arbs.filter((arbOld: Arb) => arb.hash() === arbOld.hash());
              same.forEach((sameArb: Arb) => {
                if (
                  arb.timestamp - sameArb.timestamp < 100000 &&
                  Math.abs(sameArb.score - arb.score) < 0.01
                ) {
                  console.log(`${coin} ${arb.hash()} SAME`);
                  skip = true;
                }
              });
              if (!skip) {
                this.arbs.push(arb);
                let res = this.results.get(coin);
                if (res == undefined) {
                  res = { score: 0, arbs: 0 };
                }
                res.score += arb.score;
                res.arbs++;
                this.results.set(coin, res);
              }

              console.log(arb.toString());
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
    // this.exchange.websocket.close();
  };
}
