import BidAsk from './BidAsk';

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
    this.bid = ticker.bestBid;
    this.ask = ticker.bestAskPrice;
    this.bidQuantity = ticker.bestBidQuantity;
    this.askQuantity = ticker.bestAskQuantity;
  };

  addListener = (listener: any) => {
    this.listeners.push(listener);
  };

  setBidAsk = (bidAsk: BidAsk) => {
    this.listeners.forEach(listener => {
      listener.update(bidAsk);
    });
  };
}
