import binance from 'binance';
let symbolPrices: any = {};
let triangles: Array<any> = [];
const fee = 0.075;
const startCoins = ['BTC', 'USDT', 'BNB', 'ETH', 'EUR', 'TRX', 'XRP', 'BUSD', 'DAI', 'TUSD'];
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
function createTriangles(pairs: Array<any>, startCoin: string) {
  let startPairs: Array<any> = findPairs(pairs, startCoin, true);
  let middlePairs: Array<any> = [];
  let paths: Array<any> = [];
  let current = '';
  startPairs.forEach((pair: any) => {
    let coin = pair.quoteAsset;
    if (pair.quoteAsset == startCoin) {
      coin = pair.baseAsset;
    }
    middlePairs = findPairs(pairs, coin, true);
    middlePairs.forEach(middlePair => {
      let last = middlePair.quoteAsset;
      if (middlePair.quoteAsset == coin) {
        last = middlePair.baseAsset;
      }
      pairs.forEach((lastPair: any) => {
        if (lastPair.symbol == startCoin + last || lastPair.symbol == last + startCoin) {
          let path = {
            coin: startCoin,
            start: pair,
            middle: middlePair,
            last: lastPair
          };
          paths.push(path);
        }
      });
    });
  });
  return paths;
}

function findPairs(pairs: Array<any>, coin: String, all = false) {
  let result: Array<any> = [];
  pairs.forEach((pair: any) => {
    if (coin == pair.baseAsset || (all && coin == pair.quoteAsset)) {
      result.push(pair);
    }
  });
  return result;
}

export async function findAllTriangles() {
  let pairs: Array<any> = await getAllPairs();
  console.log('Got: ' + pairs.length + ' pairs');
  startCoins.forEach((startCoin: string) => {
    let paths: any = createTriangles(pairs, startCoin);
    console.log(paths.length + ' triangles for ' + startCoin);
    triangles = triangles.concat(paths);
  });

  console.log('total of ' + triangles.length + ' triangles');
}

export async function cal() {
  await findAllTriangles();
  let binanceWS = new binance.BinanceWS();
  binanceWS.onAllTickers((data: any) => {
    data.forEach((d: any) => {
      symbolPrices[d.symbol].bidPrice = parseFloat(d.bestBid);
      symbolPrices[d.symbol].askPrice = parseFloat(d.bestAskPrice);
    });
    triangles.forEach(triangle => {
      if (
        symbolPrices[triangle.start.symbol].bidPrice == 0 ||
        symbolPrices[triangle.start.symbol].askPrice == 0 ||
        symbolPrices[triangle.middle.symbol].bidPrice == 0 ||
        symbolPrices[triangle.middle.symbol].askPrice == 0 ||
        symbolPrices[triangle.last.symbol].bidPrice == 0 ||
        symbolPrices[triangle.last.symbol].askPrice == 0
      )
        return;
      let startcoins = 1;
      let coins = startcoins;
      let type = '';
      let price = 0;
      let current = triangle.coin;
      if (current == triangle.start.baseAsset) {
        type = 'sell';
        price = symbolPrices[triangle.start.symbol].bidPrice;
        coins = coins * price;
        current = triangle.start.quoteAsset;
      } else {
        type = 'buy';
        price = symbolPrices[triangle.start.symbol].askPrice;
        coins = coins / price;
        current = triangle.start.baseAsset;
      }
      let step1 =
        type +
        ' ' +
        triangle.coin +
        ' ' +
        triangle.start.symbol +
        ' @ ' +
        symbolPrices[triangle.start.symbol].bidPrice;
      coins -= (coins / 100) * fee;

      if (current == triangle.middle.baseAsset) {
        type = 'sell';
        price = symbolPrices[triangle.middle.symbol].bidPrice;
        coins = coins * price;
        current = triangle.middle.quoteAsset;
      } else {
        type = 'buy';
        price = symbolPrices[triangle.middle.symbol].askPrice;
        coins = coins / price;
        current = triangle.middle.baseAsset;
      }
      let step2 =
        type +
        ' ' +
        triangle.coin +
        ' ' +
        triangle.middle.symbol +
        ' @ ' +
        symbolPrices[triangle.middle.symbol].bidPrice;
      coins -= (coins / 100) * fee;

      if (current == triangle.last.baseAsset) {
        type = 'sell';
        price = symbolPrices[triangle.last.symbol].bidPrice;
        coins = coins * price;
        current = triangle.last.quoteAsset;
      } else {
        type = 'buy';
        price = symbolPrices[triangle.last.symbol].askPrice;
        coins = coins / price;
        current = triangle.last.baseAsset;
      }
      let step3 =
        type +
        ' ' +
        triangle.coin +
        ' ' +
        triangle.last.symbol +
        ' @ ' +
        symbolPrices[triangle.last.symbol].bidPrice;
      coins -= (coins / 100) * fee;
      let perc = Math.round(((coins - startcoins) / startcoins) * 100000) / 1000;
      if (perc > 0.3) {
        console.log(step1);
        console.log(step2);
        console.log(step3);
        console.log(perc + '%');
        console.log();
      }
    });
  });
}

export default cal;
