import { runInThisContext } from 'vm';
import { Pair } from './Exchange';
import Path from './Path';

export default class PathFinder {
  pairs: Pair[];
  quint: boolean;
  paths: Map<string, { trio: Path[]; quad: Path[]; quint: Path[] }> = new Map();

  constructor(pairs: Pair[], coins: string[], quint = true) {
    this.pairs = pairs;
    this.quint = quint;
    this._findAll(coins);
  }

  _endPairs = (coin: string, otherCoin: string) => {
    return this.pairs.filter((pair: Pair) => {
      return (
        (coin == pair.baseAsset && otherCoin == pair.quoteAsset) ||
        (coin == pair.quoteAsset && otherCoin == pair.baseAsset)
      );
    });
  };

  _coinPairs = (coin: string) => {
    return this.pairs.filter((pair: Pair) => {
      return coin == pair.baseAsset || coin == pair.quoteAsset;
    });
  };

  _findTrio = (coin: string) => {
    let paths: Path[] = [];
    this._coinPairs(coin).forEach((startPair: Pair) => {
      let nextCoin = startPair.baseAsset == coin ? startPair.quoteAsset : startPair.baseAsset;
      this._coinPairs(nextCoin).forEach((trioPair: Pair) => {
        let trioCoin = trioPair.baseAsset == nextCoin ? trioPair.quoteAsset : trioPair.baseAsset;
        this._endPairs(coin, trioCoin).forEach((endPair: Pair) => {
          if (startPair == trioPair || trioPair == endPair) return;
          const path = new Path(coin);
          path.addPair(startPair).addPair(trioPair).addPair(endPair);
          paths.push(path);
        });
      });
    });
    return paths;
  };

  _findQuad = (coin: string) => {
    let paths: Path[] = [];
    this._coinPairs(coin).forEach((startPair: Pair) => {
      let nextCoin = startPair.baseAsset == coin ? startPair.quoteAsset : startPair.baseAsset;
      this._coinPairs(nextCoin).forEach((trioPair: Pair) => {
        let trioCoin = trioPair.baseAsset == nextCoin ? trioPair.quoteAsset : trioPair.baseAsset;
        this._coinPairs(trioCoin).forEach((quadPair: Pair) => {
          let quadCoin = quadPair.baseAsset == trioCoin ? quadPair.quoteAsset : quadPair.baseAsset;
          this._endPairs(coin, quadCoin).forEach((endPair: Pair) => {
            if (startPair == trioPair || trioPair == quadPair || quadPair == endPair) return;
            const path = new Path(coin);
            path.addPair(startPair).addPair(trioPair).addPair(quadPair).addPair(endPair);
            paths.push(path);
          });
        });
      });
    });
    return paths;
  };

  _findQuint = (coin: string) => {
    if (!this.quint) return [];
    let paths: Path[] = [];
    this._coinPairs(coin).forEach((startPair: Pair) => {
      let nextCoin = startPair.baseAsset == coin ? startPair.quoteAsset : startPair.baseAsset;
      this._coinPairs(nextCoin).forEach((trioPair: Pair) => {
        let trioCoin = trioPair.baseAsset == nextCoin ? trioPair.quoteAsset : trioPair.baseAsset;
        this._coinPairs(trioCoin).forEach((quadPair: Pair) => {
          let quadCoin = quadPair.baseAsset == trioCoin ? quadPair.quoteAsset : quadPair.baseAsset;
          this._coinPairs(quadCoin).forEach((quintPair: Pair) => {
            let quintCoin =
              quintPair.baseAsset == quadCoin ? quintPair.quoteAsset : quintPair.baseAsset;

            this._endPairs(coin, quintCoin).forEach((endPair: Pair) => {
              if (
                startPair == trioPair ||
                trioPair == quadPair ||
                quadPair == quintPair ||
                quintPair == endPair
              )
                return;
              const path = new Path(coin);
              path
                .addPair(startPair)
                .addPair(trioPair)
                .addPair(quadPair)
                .addPair(quintPair)
                .addPair(endPair);
              paths.push(path);
            });
          });
        });
      });
    });
    return paths;
  };

  _findAll = (coins: string[]) => {
    coins.forEach((coin: string) => {
      this.paths.set(coin, {
        trio: this._findTrio(coin),
        quad: this._findQuad(coin),
        quint: this._findQuint(coin)
      });
    });
  };

  getByCoin = (coin: string) => {
    const all = this.paths.get(coin);
    if (all != undefined) {
      return all.trio.concat(all.quad);
    }
    return [];
  };

  getByCoinTrio = (coin: string) => {
    const all = this.paths.get(coin);
    if (all != undefined) {
      return all.trio;
    }
    return [];
  };

  getByCoinQuad = (coin: string) => {
    const all = this.paths.get(coin);
    if (all != undefined) {
      return all.quad;
    }
    return [];
  };

  getByCoinQuint = (coin: string) => {
    const all = this.paths.get(coin);
    if (all != undefined) {
      return all.quint;
    }
    return [];
  };

  getAll = () => {
    let result: Path[] = [];
    this.paths.forEach((paths: { trio: Path[]; quad: Path[]; quint: Path[] }) => {
      const all = paths.trio.concat(paths.quad).concat(paths.quint);
      result = result.concat(all);
    });
    return result;
  };

  getAllTrio = () => {
    let result: Path[] = [];
    this.paths.forEach((paths: { trio: Path[]; quad: Path[]; quint: Path[] }) => {
      result = result.concat(paths.trio);
    });
    return result;
  };
  getAllQuad = () => {
    let result: Path[] = [];
    this.paths.forEach((paths: { trio: Path[]; quad: Path[]; quint: Path[] }) => {
      result = result.concat(paths.quad);
    });
    return result;
  };
  getAllQuint = () => {
    let result: Path[] = [];
    this.paths.forEach((paths: { trio: Path[]; quad: Path[]; quint: Path[] }) => {
      result = result.concat(paths.quint);
    });
    return result;
  };
}
