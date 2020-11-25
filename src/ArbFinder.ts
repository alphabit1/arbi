import ccxt from 'ccxt';
import Arb from './Arb';

export default class ArbFinder {
  markets: { [id: string]: ccxt.Market };

  constructor(markets: { [id: string]: ccxt.Market }) {
    this.markets = markets;
  }

  endMarkets = (coin: string, otherCoin: string): ccxt.Market[] => {
    const markets: ccxt.Market[] = [];
    Object.keys(this.markets).forEach((symbol: string) => {
      const market = this.markets[symbol];
      if (
        (coin === market.base && otherCoin === market.quote) ||
        (coin === market.quote && otherCoin === market.base)
      ) {
        markets.push(market);
      }
    });
    return markets;
  };

  coinMarkets = (coin: string): ccxt.Market[] => {
    const markets: ccxt.Market[] = [];
    Object.keys(this.markets).forEach((symbol: string) => {
      const market = this.markets[symbol];
      if (coin === market.base || coin === market.quote) {
        markets.push(market);
      }
    });
    return markets;
  };

  findTriangle = (coin: string): Arb[] => {
    const arbs: Arb[] = [];
    this.coinMarkets(coin).forEach((startMarket: ccxt.Market) => {
      const nextCoin = startMarket.base === coin ? startMarket.quote : startMarket.base;
      this.coinMarkets(nextCoin).forEach((triangleMarket: ccxt.Market) => {
        const triangleCoin =
          triangleMarket.base === nextCoin ? triangleMarket.quote : triangleMarket.base;
        this.endMarkets(coin, triangleCoin).forEach((endMarket: ccxt.Market) => {
          if (startMarket === triangleMarket || triangleMarket === endMarket) return;
          const arb = new Arb(coin);
          arb.addMarket(startMarket).addMarket(triangleMarket).addMarket(endMarket);
          arbs.push(arb);
        });
      });
    });
    return arbs;
  };

  findSquare = (coin: string): Arb[] => {
    const arbs: Arb[] = [];
    this.coinMarkets(coin).forEach((startMarket: ccxt.Market) => {
      const nextCoin = startMarket.base === coin ? startMarket.quote : startMarket.base;
      this.coinMarkets(nextCoin).forEach((triangleMarket: ccxt.Market) => {
        const triangleCoin =
          triangleMarket.base === nextCoin ? triangleMarket.quote : triangleMarket.base;
        this.coinMarkets(triangleCoin).forEach((squareMarket: ccxt.Market) => {
          const squareCoin =
            squareMarket.base === nextCoin ? squareMarket.quote : squareMarket.base;
          this.endMarkets(coin, squareCoin).forEach((endMarket: ccxt.Market) => {
            if (
              startMarket === triangleMarket ||
              triangleMarket === squareMarket ||
              squareMarket === endMarket
            )
              return;
            const arb = new Arb(coin);
            arb.addMarket(startMarket).addMarket(triangleMarket).addMarket(endMarket);
            arbs.push(arb);
          });
        });
      });
    });
    return arbs;
  };
}
