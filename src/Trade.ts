export default class Trade {
  type: string = '';
  price: number = 0;
  size: number = 0;
  total: number = 0;
  liquidity: number = 0;
  fee: number = 0;
  symbol: string = '';
  baseAsset: string = '';
  quoteAsset: string = '';

  toStr = () => {
    return `${this.symbol} ${this.type} ${this.size} ${this.baseAsset} @ ${this.price} total ${this.total} ${this.quoteAsset}\n`;
  };
}
