import { Observable, Subject } from 'threads/observable';
import { expose } from 'threads/worker';
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
  async start(coin: string, fee: number, triangle: boolean, square: boolean, penta: boolean) {
    const markets = await exchange.getMarkets();
    next(coin, 1, markets.size);

    // find all arb paths
    const finder = new PathFinder(markets, fee, triangle, square, penta);
    const trianglePaths = finder.findTriangle(coin);
    next(coin, 23, trianglePaths.length);
    const squarePaths = finder.findSquare(coin);
    next(coin, 24, squarePaths.length);
    const pentaPaths = finder.findPenta(coin);
    next(coin, 25, pentaPaths.length);
    const paths = trianglePaths.concat(squarePaths, pentaPaths);
    next(coin, 20, paths.length);

    // connect to ws for book ticker updates
    exchange.startWs((tickers: any) => {
      const start = new Date().getTime();

      tickers.forEach((ticker: any) => {
        markets.get(ticker.symbol)?.update(ticker);
      });

      paths.forEach(path => {
        const calc = path.calculate();
        if (calc.score > 0.01) {
          next(coin, 666, { score: calc.score, actions: calc.score });
        }
      });

      const time = (new Date().getTime() - start) / 1000;
      next(coin, 3, time);
    });
  },
  values() {
    return Observable.from(subject);
  }
};
expose(arbiWorker);
