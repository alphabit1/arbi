import { spawn, Thread, Worker } from 'threads';
import Arbi from './Arbi';
import { ArbiStarter } from './workers/arbiStarter';
const threaded = true;
const fee = 0.075;
const quint = false;
let baseCoins: string[] = ['BTC', 'BNB', 'LTC', 'ETH', 'USDT', 'BUSD', 'EUR', 'GBP', 'TRX', 'XRP'];
(async () => {
  if (threaded) {
    baseCoins.forEach(async (coin: string) => {
      const arbiStarter: ArbiStarter = await spawn<ArbiStarter>(
        new Worker('./workers/arbiStarter')
      );
      arbiStarter.start([coin], fee, quint);
    });
  } else {
    let arbi = new Arbi(baseCoins, fee);
    arbi.init(quint).then(() => {
      arbi.start();
    });
  }
})();
