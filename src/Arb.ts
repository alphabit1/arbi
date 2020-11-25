import { Trade, Market } from 'ccxt';

export default class Arb {
  coin: string;

  trades: Trade[] = [];

  markets: Market[] = [];

  constructor(coin: string) {
    this.coin = coin;
  }

  addMarket = (market: Market): Arb => {
    this.markets.push(market);
    return this;
  };
}
