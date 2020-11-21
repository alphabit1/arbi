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
  usedPaths: string[] = [];
  hashes: string[] = [];

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
    console.log(`${this.paths.length} paths`);
    console.log();
  };

  start = () => {
    // connect to ws for book ticker updates
    this.exchange.startWs((tickers: any) => {
      let start = new Date().getTime();
      tickers.forEach((ticker: any) => {
        this.markets.get(ticker.symbol)?.update(ticker);
      });

      this.paths.forEach(p => {
        // if (p.markets[0].symbol == 'LTCUSDT') console.log(p.markets[0].updated);
        if (p.markets.some(market => market.updated)) {
          let score = p.calculate(this.fee);
          if (score > 0.1) {
            this.arbs.push(p);
            this.perc += score;
            this.usedPaths.push(p.toString());
            this.hashes.push(p.hash());
          }
        }
      });

      this.markets.forEach((market: Market) => {
        market.updated = false;
      });
      let unique = [...new Set(this.usedPaths)];
      let unique1 = [...new Set(this.hashes)];
      console.log(
        `${this.baseCoins[0]} hashes: ${unique1.length} paths: ${unique.length} arbs: ${
          this.arbs.length
        } profit: ${Math.round(this.perc * 100) / 100}%`
      );
      let time = (new Date().getTime() - start) / 1000;
      if (time > 1) {
        console.log(`>>>> ${this.baseCoins[0]} ${time}s`);
      }
    });
  };

  stop = () => {
    this.exchange.websocket.close();
  };
}
