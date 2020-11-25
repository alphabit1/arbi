import Arb from './Arb';

export default class CoinWorker {
  coin: string;

  arbs: Arb[];

  log: pino.Logger;

  constructor(coin: string, arbs: Arb[], log: pino.Logger) {
    this.coin = coin;
    this.arbs = arbs;
    this.log = log;
    this.log.info(`${coin} $arbs`);
  }
}
