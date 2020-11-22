import Arbi from './Arbi';

const fee = 0.075;
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
  const arbi = new Arbi(baseCoins, fee, true, false, false);
  arbi.start();
})();
