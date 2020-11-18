import binance from 'binance';

// get all pairs
// find routes x deep
// start ws update bid and ask
// calc profit perc for updated bid/ask

let symbolPrices: any = {};

function getAllPairs() {
  return new Promise<any>((resolve, reject) => {
    const bRest = new binance.BinanceRest({
      key: '', // Get this from your account on binance.com
      secret: '', // Same for this
      timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
      recvWindow: 10000, // Optional, defaults to 5000, increase if you're getting timestamp errors
      disableBeautification: false,
      handleDrift: true
    });
    bRest.exchangeInfo().then((data: any) => {
      let validPairs: any = [];
      data.symbols.forEach((d: any) => {
        if (d.status === 'TRADING') {
          validPairs.push(d);
          symbolPrices[d.symbol] = { bidPrice: 0, askPrice: 0 };
        }
      });
      resolve(validPairs);
    });
  });
}

function findPaths(pairs: Array<any>, startCoin: string, currentCoin: string, depth = 2) {
  let currentPairs = findPairs(pairs, currentCoin);
  console.log(currentPairs.length + ' pairs for ' + currentCoin);
  let path:any[] = [];
  currentPairs.forEach((currentPair: any) => {
    let path = []
    let nextCoin = currentPair.baseAsset;
    if (currentPair.baseAsset == currentCoin) {
      nextCoin = currentPair.quoteAsset;
    }

    
    path.push(currentPair)
    if (depth > 0) {
      path.push(findPaths(pairs, startCoin, nextCoin, depth - 1));
    } else {
      // paths.push(path)
    }
    // let nextPairs = findPairs(pairs, currentCoin);
    // nextPairs.forEach(p => {
    //   console.log(currentPair.symbol + ' - ' + p.symbol);
    // });
  });
  return path;
}

function findPairs(pairs: Array<any>, coin: String) {
  let result: Array<any> = [];
  pairs.forEach((pair: any) => {
    if (coin == pair.baseAsset || coin == pair.quoteAsset) {
      result.push(pair);
    }
  });
  return result;
}
getAllPairs().then(res => {
  console.log(res.length + ' pairs');
  console.log(findPaths(res, 'BTC', 'BTC', 4).length);
});
