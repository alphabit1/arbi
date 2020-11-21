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
      console.log(`${coin} trio: ${trio.length} quad: ${quad.length} quint: ${quint.length}`);
    });
    console.log(`${this.paths.length} paths`);

    // for every Path add a listener to every Market it traverses
    this.paths.forEach((path: Path) => {
      path.markets.forEach((market: Market) => {
        const marketWithListener = this.markets.get(market.symbol);
        if (marketWithListener == undefined) return;
        marketWithListener.addListener(() => {
          let calc = path.calculate(this.fee);
          if (calc.score > 0.1) {
            this.arbs.push(path);
            console.log(calc.str);
            console.log(calc.score);
            this.perc += calc.score;
            console.log(`arbs: ${this.arbs.length} total: ${Math.round(this.perc * 100) / 100}%`);
            console.log();
          }
        });
        this.markets.set(market.symbol, marketWithListener);
      });
    });
  };
  start = () => {
    // connect to ws for book ticker updates
    this.exchange.startWs((tickers: any) => {
      tickers.forEach((ticker: any) => {
        this.markets.get(ticker.symbol)?.update(ticker);
      });
    });
  };

  stop = () => {
    this.exchange.websocket.close();
  };
}
