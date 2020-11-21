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

  isUpdated = (market: Market | undefined) => {
    if (market == undefined) return false;
    return (
      this.bid != market.bid ||
      this.ask != market.ask ||
      this.bidQuantity != market.bidQuantity ||
      this.askQuantity != market.askQuantity
    );
  };
  hash = () => {
    return `${this.symbol} ${this.bid} ${this.bidQuantity} ${this.ask} ${this.askQuantity}`;
  };
}
