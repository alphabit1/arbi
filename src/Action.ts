export default class Action {
  symbol: string;
  base: string;
  quote: string;

  price: number;

  size: number;

  type: string;

  result: number;

  resultPreFee: number;

  constructor(
    symbol: string,
    base: string,
    quote: string,
    price: number,
    size: number,
    type: string,
    resultPreFeet: number,
    result: number
  ) {
    this.symbol = symbol;
    this.base = base;
    this.quote = quote;
    this.price = price;
    this.size = size;
    this.type = type;
    this.resultPreFee = resultPreFeet;
    this.result = result;
  }
}
