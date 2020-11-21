import Exchange from './Exchange';
import Market from './Market';
import Path from './Path';
import PathFinder from './PathFinder';

export default class Arbi {
  exchange: Exchange = new Exchange();
  markets: Map<string, Market> = new Map();
  baseCoins: string[] = ['BTC', 'BNB', 'LTC', 'ETH', 'USDT', 'BUSD'];
  paths: Path[] = [];
  fee = 0.075;
  arbs: Path[] = [];
  balance = 1;
  perc = 0;
  tp: Map<string, Path[]> = new Map();

  constructor(baseCoins: string[], fee: number) {
    this.baseCoins = baseCoins;
    this.fee = fee;
  }

  init = async (quint = true) => {
    // get all active markets
    this.markets = await this.exchange.getMarkets();
    console.log(`${this.markets.size} active markets`);

    // find all arb paths
    console.log(`Finding arb paths for: ${this.baseCoins.join(', ')}`);
    let finder = new PathFinder(this.markets, this.baseCoins, quint);
    this.baseCoins.forEach((coin: string) => {
      let trio = finder.getByCoinTrio(coin);
      let quad = finder.getByCoinQuad(coin);
      let quint = finder.getByCoinQuint(coin);
      this.paths = this.paths.concat(trio, quad, quint);
      console.log(`trio: ${trio.length} quad: ${quad.length} quint: ${quint.length}`);
    });

    // for every Path add a listener to every Market it traverses
    this.paths.forEach((path: Path) => {
      path.markets.forEach((market: Market) => {
        const marketWithListener = this.markets.get(market.symbol);
        if (marketWithListener == undefined) return;
        marketWithListener.addListener(() => {
          let calc = path.calculate(this.fee);
          if (calc.score > 0.1) {
            this.arbs.push(path);
            // console.log(calc.str);
            // console.log(calc.score);
            this.perc += calc.score;
            // console.log();
          }
        });
        this.markets.set(market.symbol, marketWithListener);
      });
    });
    let tempMarkets: Map<string, Market> = new Map();
    this.markets.forEach((market: Market) => {
      market.spawnThread();
      tempMarkets.set(market.symbol, market);
    });
    this.markets = tempMarkets;
    console.log(`${this.paths.length} paths`);
    console.log();
  };

  start = () => {
    // connect to ws for book ticker updates
    this.exchange.startWs((tickers: any) => {
      let start = new Date().getTime();
      // console.time(`${this.baseCoins[0]} loop`);
      tickers.forEach((ticker: any) => {
        this.markets.get(ticker.symbol)?.update(ticker);
      });
      tickers.forEach((ticker: any) => {
        this.markets.get(ticker.symbol)?._callListeners();
      });

      console.log(
        `${this.baseCoins[0]} arbs: ${this.arbs.length} total: ${
          Math.round(this.perc * 100) / 100
        }%`
      );
      let time = (new Date().getTime() - start) / 1000;
      if (time > 2) {
        console.log(`>>>> ${this.baseCoins[0]} ${time}s`);
      }

      // console.timeEnd(`${this.baseCoins[0]} loop`);
      // console.log();
    });
  };

  stop = () => {
    this.exchange.websocket.close();
  };
}
