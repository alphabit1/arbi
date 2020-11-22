export default class Action {
  symbol: string;

  price: number;

  size: number;

  type: string;

  constructor(symbol: string, price: number, size: number, type: string) {
    this.symbol = symbol;
    this.price = price;
    this.size = size;
    this.type = type;
  }
}
