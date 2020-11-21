import { Caller } from './workers/caller';
import { spawn, Thread, Worker } from 'threads';

// type Caller = (listeners: any[]) => Promise<void>;
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
  thread: Caller | undefined = undefined;
  updated = false;

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
      this.updated = true;
      this.bid = ticker.bestBid;
      this.ask = ticker.bestAskPrice;
      this.bidQuantity = ticker.bestBidQuantity;
      this.askQuantity = ticker.bestAskQuantity;
      // this._callListeners();
    }
  };

  addListener = (listener: any) => {
    this.listeners.push(listener);
  };

  spawnThread = async () => {
    // this.thread = await spawn<Caller>(new Worker('./workers/caller'));
  };

  _callListeners = () => {
    if (this.updated) {
      this.updated = false;
      // this.thread?.go(this.listeners, 'aaa');
      this.listeners.forEach((listener: any) => {
        listener();
      });
    }

    // if (this.listeners.length > 40000) console.log(this.listeners.length);
    // console.time('caller');
    // console.time(this.symbol + ' listener loop');

    // console.timeEnd(this.symbol + ' listener loop');
    // console.timeEnd('caller');
    // if (this.listeners.length > 40000) console.timeEnd('caller');
  };
}
