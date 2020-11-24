import { spawn, Thread, Worker } from 'threads';

// type Caller = (listeners: any[]) => Promise<void>;
export default class Market {
  symbol: string;

  status: string;

  baseAsset: string;
  baseAssetPrecision: number;
  baseCommissionPrecision: number;

  quoteAsset: string;
  quotePrecision: number;
  quoteAssetPrecision: number;
  quoteCommissionPrecision: number;

  filters: any[];

  bid: number;

  ask: number;

  bidQuantity: number;

  askQuantity: number;
  lotPrecision: number;
  stepSize: number;
  symbolInfo: any;
  constructor(market: any, ticker: any) {
    this.symbolInfo = market;
    this.symbol = market.symbol;
    this.status = market.status;
    this.baseAsset = market.baseAsset;
    this.baseAssetPrecision = market.baseAssetPrecision;
    this.baseCommissionPrecision = market.baseCommissionPrecision;

    this.quoteAsset = market.quoteAsset;
    this.quotePrecision = market.quotePrecision;
    this.quoteAssetPrecision = market.quoteAssetPrecision;
    this.quoteCommissionPrecision = market.quoteCommissionPrecision;

    this.filters = market.filters;

    let lot_size = market.filters.filter((filter: any) => {
      return filter.filterType == 'LOT_SIZE';
    })[0];
    let step_size = lot_size.stepSize;
    this.lotPrecision = step_size.substr(2).indexOf('1') + 1;
    this.stepSize = step_size;
    this.quoteAsset = market.quoteAsset;
    this.bid = ticker.bidPrice;
    this.ask = ticker.askPrice;
    this.bidQuantity = ticker.bidQty;
    this.askQuantity = ticker.askQty;
  }

  update = (ticker: any): boolean => {
    if (
      this.bid !== ticker.bestBid ||
      this.ask !== ticker.bestAskPrice ||
      this.bidQuantity !== ticker.bestBidQuantity ||
      this.askQuantity !== ticker.bestAskQuantity
    ) {
      this.bid = ticker.bestBid;
      this.ask = ticker.bestAskPrice;
      this.bidQuantity = ticker.bestBidQuantity;
      this.askQuantity = ticker.bestAskQuantity;
      return true;
    }
    return false;
  };
}
