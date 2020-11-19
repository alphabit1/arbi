import binance from 'binance';

export interface Pair {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
}

class Exchange {
  ws: any = null;
  constructor() {}

  startWs = (tickerCallback: any) => {
    let nanceWs = new binance.BinanceWS();
    this.ws = nanceWs.onAllTickers((data: any) => {
      tickerCallback(data);
    });
  };

  getAllPairs = (dev = false) => {
    return new Promise<any>((resolve, reject) => {
      const binanceRest = new binance.BinanceRest({
        key: '',
        secret: '',
        disableBeautification: false,
        handleDrift: true
      });
      binanceRest.exchangeInfo().then((data: any) => {
        resolve(
          data.symbols.filter((d: any) => {
            return d.status === 'TRADING';
          })
        );
      });
    });
  };
}
export default Exchange;
