import Arbi from './Arbi';

const fee = 0.06;
const tradeSize = 13;
const threshold = 0.1;
const triangle = true;
const square = false;
const penta = false;
const baseCoins: string[] = [
  'BTC',
  // 'BNB',
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
  const arbi = new Arbi(baseCoins, fee, tradeSize, threshold, triangle, square, penta);
  arbi.start();
})();
