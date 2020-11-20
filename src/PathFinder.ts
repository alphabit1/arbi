import { runInThisContext } from 'vm';
import Market from './Market';
import Path from './Path';

export default class PathFinder {
  markets: Market[];
  quint: boolean;
  paths: Map<string, { trio: Path[]; quad: Path[]; quint: Path[] }> = new Map();

  constructor(markets: Map<string, Market>, coins: string[], quint = true) {
    this.markets = Array.from(markets, (market: any) => market[1]);
    this.quint = quint;
    this._findAll(coins);
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

  _findTrio = (coin: string): Path[] => {
    let paths: Path[] = [];
    this._coinMarkets(coin).forEach((startMarket: Market) => {
      let nextCoin = startMarket.baseAsset == coin ? startMarket.quoteAsset : startMarket.baseAsset;
      this._coinMarkets(nextCoin).forEach((trioMarket: Market) => {
        let trioCoin =
          trioMarket.baseAsset == nextCoin ? trioMarket.quoteAsset : trioMarket.baseAsset;
        this._endMarkets(coin, trioCoin).forEach((endMarket: Market) => {
          if (startMarket == trioMarket || trioMarket == endMarket) return;
          const path = new Path(coin);
          path.addMarket(startMarket).addMarket(trioMarket).addMarket(endMarket);
          paths.push(path);
        });
      });
    });
    return paths;
  };

  _findQuad = (coin: string): Path[] => {
    let paths: Path[] = [];
    this._coinMarkets(coin).forEach((startMarket: Market) => {
      let nextCoin = startMarket.baseAsset == coin ? startMarket.quoteAsset : startMarket.baseAsset;
      this._coinMarkets(nextCoin).forEach((trioMarket: Market) => {
        let trioCoin =
          trioMarket.baseAsset == nextCoin ? trioMarket.quoteAsset : trioMarket.baseAsset;
        this._coinMarkets(trioCoin).forEach((quadMarket: Market) => {
          let quadCoin =
            quadMarket.baseAsset == trioCoin ? quadMarket.quoteAsset : quadMarket.baseAsset;
          this._endMarkets(coin, quadCoin).forEach((endMarket: Market) => {
            if (startMarket == trioMarket || trioMarket == quadMarket || quadMarket == endMarket)
              return;
            const path = new Path(coin);
            path
              .addMarket(startMarket)
              .addMarket(trioMarket)
              .addMarket(quadMarket)
              .addMarket(endMarket);
            paths.push(path);
          });
        });
      });
    });
    return paths;
  };

  _findQuint = (coin: string): Path[] => {
    if (!this.quint) return [];
    let paths: Path[] = [];
    this._coinMarkets(coin).forEach((startMarket: Market) => {
      let nextCoin = startMarket.baseAsset == coin ? startMarket.quoteAsset : startMarket.baseAsset;
      this._coinMarkets(nextCoin).forEach((trioMarket: Market) => {
        let trioCoin =
          trioMarket.baseAsset == nextCoin ? trioMarket.quoteAsset : trioMarket.baseAsset;
        this._coinMarkets(trioCoin).forEach((quadMarket: Market) => {
          let quadCoin =
            quadMarket.baseAsset == trioCoin ? quadMarket.quoteAsset : quadMarket.baseAsset;
          this._coinMarkets(quadCoin).forEach((quintMarket: Market) => {
            let quintCoin =
              quintMarket.baseAsset == quadCoin ? quintMarket.quoteAsset : quintMarket.baseAsset;

            this._endMarkets(coin, quintCoin).forEach((endMarket: Market) => {
              if (
                startMarket == trioMarket ||
                trioMarket == quadMarket ||
                quadMarket == quintMarket ||
                quintMarket == endMarket
              )
                return;
              const path = new Path(coin);
              path
                .addMarket(startMarket)
                .addMarket(trioMarket)
                .addMarket(quadMarket)
                .addMarket(quintMarket)
                .addMarket(endMarket);
              paths.push(path);
            });
          });
        });
      });
    });
    return paths;
  };

  _findAll = (coins: string[]): void => {
    coins.forEach((coin: string) => {
      this.paths.set(coin, {
        trio: this._findTrio(coin),
        quad: this._findQuad(coin),
        quint: this._findQuint(coin)
      });
    });
  };

  getByCoin = (coin: string): Path[] => {
    const all = this.paths.get(coin);
    if (all != undefined) {
      return all.trio.concat(all.quad);
    }
    return [];
  };

  getByCoinTrio = (coin: string): Path[] => {
    const all = this.paths.get(coin);
    if (all != undefined) {
      return all.trio;
    }
    return [];
  };

  getByCoinQuad = (coin: string): Path[] => {
    const all = this.paths.get(coin);
    if (all != undefined) {
      return all.quad;
    }
    return [];
  };

  getByCoinQuint = (coin: string): Path[] => {
    const all = this.paths.get(coin);
    if (all != undefined) {
      return all.quint;
    }
    return [];
  };

  getAll = (): Path[] => {
    let result: Path[] = [];
    this.paths.forEach((paths: { trio: Path[]; quad: Path[]; quint: Path[] }) => {
      const all = paths.trio.concat(paths.quad).concat(paths.quint);
      result = result.concat(all);
    });
    return result;
  };

  getAllTrio = (): Path[] => {
    let result: Path[] = [];
    this.paths.forEach((paths: { trio: Path[]; quad: Path[]; quint: Path[] }) => {
      result = result.concat(paths.trio);
    });
    return result;
  };
  getAllQuad = (): Path[] => {
    let result: Path[] = [];
    this.paths.forEach((paths: { trio: Path[]; quad: Path[]; quint: Path[] }) => {
      result = result.concat(paths.quad);
    });
    return result;
  };
  getAllQuint = (): Path[] => {
    let result: Path[] = [];
    this.paths.forEach((paths: { trio: Path[]; quad: Path[]; quint: Path[] }) => {
      result = result.concat(paths.quint);
    });
    return result;
  };
}
