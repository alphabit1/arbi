import { Observable, Subject } from 'threads/observable';
import { expose } from 'threads/worker';
import Path from '../Path';
import Exchange from '../Exchange';
import PathFinder from '../PathFinder';

let subject = new Subject();
const exchange = new Exchange();
const next = (coin: string, code: number, data: any) => {
  subject.next({
    coin,
    code,
    data
  });
};
const arbiWorker = {
  finish() {
    exchange.websocket.close();
    subject.complete();
    subject = new Subject();
  },
  async start(
    coin: string,
    startAmount: number,
    threshold: number,
    fee: number,
    triangle: boolean,
    square: boolean,
    penta: boolean
  ) {
    const markets = await exchange.getMarkets();
    next(coin, 1, markets.size);

    // find all arb paths
    const finder = new PathFinder(markets, fee, triangle, square, penta);
    let trianglePaths: Path[] = [];
    let squarePaths: Path[] = [];
    let pentaPaths: Path[] = [];
    let paths: Path[] = [];

    try {
      trianglePaths = finder.findTriangle(coin);
      next(coin, 23, trianglePaths.length);
      squarePaths = finder.findSquare(coin);
      next(coin, 24, squarePaths.length);
      pentaPaths = finder.findPenta(coin);
      next(coin, 25, pentaPaths.length);
      paths = trianglePaths.concat(squarePaths, pentaPaths);
      next(coin, 20, paths.length);
    } catch (e) {
      return;
    }
    // connect to ws for book ticker updates
    exchange.startWs((tickers: any) => {
      const start = new Date().getTime();

      tickers.forEach((ticker: any) => {
        markets.get(ticker.symbol)?.update(ticker);
      });

      paths.forEach(path => {
        const calc = path.calculate(startAmount);
        if (calc.score > threshold) {
          next(coin, 666, {
            score: calc.score,
            profit: calc.profit,
            string: calc.string,
            trades: calc.trades
          });
        }
      });

      let time = (new Date().getTime() - start) / 1000;
      if (time === 0) time = 0.001;
      next(coin, 3, time);
    });
  },
  values() {
    return Observable.from(subject);
  }
};
expose(arbiWorker);
