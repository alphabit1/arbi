import Arbi from './Arbi';

const fee = 0.075;
const tradeSize = 20;
const threshold = 0;
const baseCoins: string[] = [
  'BTC',
  'BNB',
  'LTC',
  'ETH',
  'USDT',
  'BUSD',
  'EUR',
  'GBP',
  'TRX',
  'XRP'
];
(async () => {
  const arbi = new Arbi(baseCoins, fee, tradeSize, threshold, true, false, false);
  arbi.start();
})();
