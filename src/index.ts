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
  const arbi = new Arbi(['BTC', 'LTC'], fee, true, true, false);
  arbi.start();
})();
