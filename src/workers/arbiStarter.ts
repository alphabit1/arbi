import Arbi from './../Arbi';
import { expose } from 'threads/worker';

const arbiStarter = {
  start(coins: string[], fee: number, quint: boolean) {
    let arbi = new Arbi(coins, fee);
    arbi.init(quint).then(() => {
      arbi.start();
    });
  }
};

export type ArbiStarter = typeof arbiStarter;

expose(arbiStarter);
