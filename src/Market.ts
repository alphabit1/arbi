export default class Market {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  listeners: any[] = [];
  bid: number;
  ask: number;
  bidQuantity: number;
  askQuantity: number;

  constructor(market: any, ticker: any) {
    this.symbol = market.symbol;
    this.status = market.status;
    this.baseAsset = market.baseAsset;
    this.quoteAsset = market.quoteAsset;
    this.bid = ticker.bidPrice;
    this.ask = ticker.askPrice;
    this.bidQuantity = ticker.bidQty;
    this.askQuantity = ticker.askQty;
  }

  update = (ticker: any) => {
    if (
      this.bid != ticker.bestBid ||
      this.ask != ticker.bestAskPrice ||
      this.bidQuantity != ticker.bestBidQuantity ||
      this.askQuantity != ticker.bestAskQuantity
    ) {
      this.bid = ticker.bestBid;
      this.ask = ticker.bestAskPrice;
      this.bidQuantity = ticker.bestBidQuantity;
      this.askQuantity = ticker.bestAskQuantity;
      this._callListeners();
    }
  };

  addListener = (listener: any) => {
    this.listeners.push(listener);
  };

  _callListeners = () => {
    // if (this.listeners.length > 40000) console.log(this.listeners.length);
    // console.time('caller');
    // console.time(this.symbol + ' listener loop');
    this.listeners.forEach((listener: any) => {
      listener();
    });
    // console.timeEnd(this.symbol + ' listener loop');
    // console.timeEnd('caller');
    // if (this.listeners.length > 40000) console.timeEnd('caller');
  };
}
