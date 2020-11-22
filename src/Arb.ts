import Action from './Action';

export default class Arb {
  actions: Action[] = [];

  coin: string;

  score: number;

  timestamp: number;

  constructor(coin: string, score: number, actions: Action[]) {
    this.coin = coin;
    this.score = score;
    this.actions = actions;
    this.timestamp = new Date().getTime();
  }

  hash = (): string => {
    let result = '';
    this.actions.forEach((action: Action) => {
      result += `${action.symbol}->`;
    });
    return result.substr(0, result.length - 2);
  };

  toString = (): string => {
    return `${this.hash()}: ${this.score}%`;
  };

  toStringFull = (): string => {
    let result = '';
    this.actions.forEach((action: Action) => {
      result += `${action.type} ${action.symbol} ${action.size} @ ${action.price}\n`;
    });
    return `${result} ${this.score}`;
  };
}
