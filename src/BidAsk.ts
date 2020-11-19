export default class BidAsk {
  symbol: string;
  bid: number;
  ask: number;
  bidQuantity: number;
  askQuantity: number;
  constructor(market: any) {
    this.symbol = market.symbol;
    this.bid = market.bestBid;
    this.ask = market.bestAskPrice;
    this.bidQuantity = market.bestBidQuantity;
    this.askQuantity = market.bestAskQuantity;
  }
}
