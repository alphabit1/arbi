import { allowedNodeEnvironmentFlags } from 'process';
import Action from './Action';

export default class Arb {
  actions: Action[] = [];

  coin: string;

  score: number;

  timestamp: number;

  string: string;

  constructor(coin: string, score: number, actions: Action[], string: string) {
    this.coin = coin;
    this.score = score;
    this.actions = actions;
    this.timestamp = new Date().getTime();
    this.string = string;
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

  proof = () => {
    let result = '';
    this.actions.forEach((action: Action) => {
      if (action.type == 'buy') {
      }
      result += `${action.type} ${action.symbol} ${action.size} ${action.base} @ ${action.price} = ${action.resultPreFee} ${action.quote}\n`;
      // else
      // result += `${action.type} ${action.symbol} ${action.size} ${action.quote} @ ${action.price} = ${action.resultPreFee} - ${action.result} ${action.base}\n`;
    });
  };

  toStringFull = (): string => {
    let result = '';
    this.actions.forEach((action: Action) => {
      if (action.type == 'sell')
        result += `${action.type} ${action.symbol} ${action.size} ${action.base} @ ${action.price} = ${action.resultPreFee} ${action.quote}\n`;
      else
        result += `${action.type} ${action.symbol} ${action.resultPreFee} ${action.base} @ ${action.price} = ${action.size} ${action.quote}\n`;
    });
    return result + `${this.score}`;
  };
}
