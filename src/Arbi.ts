import Exchange from './Exchange';
import Market from './Market';
import PathFinder from './PathFinder';

export default class Arbi {
  exchange: Exchange = new Exchange();
  markets: Map<string, Market> = new Map();
  baseCoins: string[] = ['BTC', 'BNB', 'LTC'];

  constructor() {}
  start = async () => {
    this.markets = await this.exchange.getMarkets();
    let finder = new PathFinder(this.markets, this.baseCoins, true);
    this.baseCoins.forEach((coin: string) => {
      let trio = finder.getByCoinTrio(coin);
      let quad = finder.getByCoinQuad(coin);
      let quint = finder.getByCoinQuint(coin);
      console.log(`${coin} trio: ${trio.length} quad: ${quad.length} quint: ${quint.length}`);
    });
  };
}
