// import binance from 'binance';
// import Path from './Path';
// import PathFinder from './PathFinder';

import Path from './Path';
import PathFinder from './PathFinder';
import Exchange from './Exchange';
import BidAsk from './BidAsk';

const pairs = [
  {
    symbol: 'ETHBTC',
    status: 'TRADING',
    baseAsset: 'ETH',
    quoteAsset: 'BTC'
  },
  {
    symbol: 'BNBBTC',
    status: 'TRADING',
    baseAsset: 'BNB',
    quoteAsset: 'BTC'
  },
  {
    symbol: 'BNBETH',
    status: 'TRADING',
    baseAsset: 'BNB',
    quoteAsset: 'ETH'
  },
  {
    symbol: 'LTCBNB',
    status: 'TRADING',
    baseAsset: 'LTC',
    quoteAsset: 'BNB'
  },
  {
    symbol: 'LTCBTC',
    status: 'TRADING',
    baseAsset: 'LTC',
    quoteAsset: 'BTC'
  },
  {
    symbol: 'XTCBTC',
    status: 'TRADING',
    baseAsset: 'XTC',
    quoteAsset: 'BTC'
  }
];
const bidAsk: Map<string, BidAsk> = new Map();
const startCoins = ['BNB'];
const exchange = new Exchange();
exchange.getAllPairs().then(pairs => {
  console.log(`${pairs.length} pairs`);
  console.log(`Finding paths for ${startCoins.join(', ')}...`);
  const finder = new PathFinder(pairs, startCoins, false);

  startCoins.forEach((coin: string) => {
    let trio = finder.getByCoinTrio(coin);
    let quad = finder.getByCoinQuad(coin);
    let quint = finder.getByCoinQuint(coin);
    console.log(`${coin} trio: ${trio.length} quad: ${quad.length} quint: ${quint.length}`);
  });

  exchange.startWs((data: any) => {
    // console.time('outerloop');
    data.forEach((market: any) => {
      bidAsk.set(market.symbol, new BidAsk(market));
      finder.getAll().forEach((path: Path) => {
        if (path.hasSymbol(market.symbol)) {
          let result: { score: number; str: string } = path.calculate(0.075, bidAsk);
          if (result.score > 0) {
            console.log(result.str);
            console.log(result.score);
            console.log();
          }
        }
      });
    });
    // console.timeEnd('outerloop');
  });
});
