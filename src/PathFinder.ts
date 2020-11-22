import { runInThisContext } from 'vm';
import Market from './Market';
import Path from './Path';

export default class PathFinder {
  markets: Market[];

  penta: boolean;

  square: boolean;

  triangle: boolean;

  paths: Map<string, { triangle: Path[]; square: Path[]; penta: Path[] }> = new Map();

  fee: number;

  constructor(
    markets: Map<string, Market>,
    fee: number,
    triangle = true,
    square = true,
    penta = true
  ) {
    this.markets = Array.from(markets, (market: any) => market[1]);
    this.fee = fee;
    this.penta = penta;
    this.square = square;
    this.triangle = triangle;
    // this._findAll(coins);
  }

  _endMarkets = (coin: string, otherCoin: string): Market[] => {
    return this.markets.filter((market: Market) => {
      return (
        (coin == market.baseAsset && otherCoin == market.quoteAsset) ||
        (coin == market.quoteAsset && otherCoin == market.baseAsset)
      );
    });
  };

  _coinMarkets = (coin: string): Market[] => {
    return this.markets.filter((market: Market) => {
      return coin == market.baseAsset || coin == market.quoteAsset;
    });
  };

  findTriangle = (coin: string): Path[] => {
    if (!this.triangle) return [];
    const paths: Path[] = [];
    this._coinMarkets(coin).forEach((startMarket: Market) => {
      const nextCoin =
        startMarket.baseAsset == coin ? startMarket.quoteAsset : startMarket.baseAsset;
      this._coinMarkets(nextCoin).forEach((triangleMarket: Market) => {
        const triangleCoin =
          triangleMarket.baseAsset == nextCoin
            ? triangleMarket.quoteAsset
            : triangleMarket.baseAsset;
        this._endMarkets(coin, triangleCoin).forEach((endMarket: Market) => {
          if (startMarket == triangleMarket || triangleMarket == endMarket) return;
          const path = new Path(coin, this.fee);
          path.addMarket(startMarket).addMarket(triangleMarket).addMarket(endMarket);
          paths.push(path);
        });
      });
    });
    return paths;
  };

  findSquare = (coin: string): Path[] => {
    if (!this.square) return [];
    const paths: Path[] = [];
    this._coinMarkets(coin).forEach((startMarket: Market) => {
      const nextCoin =
        startMarket.baseAsset == coin ? startMarket.quoteAsset : startMarket.baseAsset;
      this._coinMarkets(nextCoin).forEach((triangleMarket: Market) => {
        const triangleCoin =
          triangleMarket.baseAsset == nextCoin
            ? triangleMarket.quoteAsset
            : triangleMarket.baseAsset;
        this._coinMarkets(triangleCoin).forEach((squareMarket: Market) => {
          const squareCoin =
            squareMarket.baseAsset == triangleCoin
              ? squareMarket.quoteAsset
              : squareMarket.baseAsset;
          this._endMarkets(coin, squareCoin).forEach((endMarket: Market) => {
            if (
              startMarket == triangleMarket ||
              triangleMarket == squareMarket ||
              squareMarket == endMarket
            )
              return;
            const path = new Path(coin, this.fee);
            path
              .addMarket(startMarket)
              .addMarket(triangleMarket)
              .addMarket(squareMarket)
              .addMarket(endMarket);
            paths.push(path);
          });
        });
      });
    });
    return paths;
  };

  findPenta = (coin: string): Path[] => {
    if (!this.penta) return [];
    const paths: Path[] = [];
    this._coinMarkets(coin).forEach((startMarket: Market) => {
      const nextCoin =
        startMarket.baseAsset == coin ? startMarket.quoteAsset : startMarket.baseAsset;
      this._coinMarkets(nextCoin).forEach((triangleMarket: Market) => {
        const triangleCoin =
          triangleMarket.baseAsset == nextCoin
            ? triangleMarket.quoteAsset
            : triangleMarket.baseAsset;
        this._coinMarkets(triangleCoin).forEach((squareMarket: Market) => {
          const squareCoin =
            squareMarket.baseAsset == triangleCoin
              ? squareMarket.quoteAsset
              : squareMarket.baseAsset;
          this._coinMarkets(squareCoin).forEach((pentaMarket: Market) => {
            const pentaCoin =
              pentaMarket.baseAsset == squareCoin ? pentaMarket.quoteAsset : pentaMarket.baseAsset;

            this._endMarkets(coin, pentaCoin).forEach((endMarket: Market) => {
              if (
                startMarket == triangleMarket ||
                triangleMarket == squareMarket ||
                squareMarket == pentaMarket ||
                pentaMarket == endMarket
              )
                return;
              const path = new Path(coin, this.fee);
              path
                .addMarket(startMarket)
                .addMarket(triangleMarket)
                .addMarket(squareMarket)
                .addMarket(pentaMarket)
                .addMarket(endMarket);
              paths.push(path);
            });
          });
        });
      });
    });
    return paths;
  };

  findAll = (coins: string[]): void => {
    coins.forEach((coin: string) => {
      this.paths.set(coin, {
        triangle: this.findTriangle(coin),
        square: this.findSquare(coin),
        penta: this.findPenta(coin)
      });
    });
  };
}
