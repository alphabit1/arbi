import { Observable, Subject } from 'threads/observable';
import { spawn, Thread, Worker } from 'threads';
import Spinnies from 'spinnies';
import Exchange from './Exchange';
import Market from './Market';
import Path from './Path';
import PathFinder from './PathFinder';
import Action from './Action';
import Arb from './Arb';

const fillSpaces = (str: string, length: number) => {
  const fill = length - str.length;
  for (let i = 0; i < fill; i++) {
    str += ' ';
  }

  return str;
};

export default class Arbi {
  baseCoins: string[] = [];

  fee: number;

  threshold: number;

  tradeSize: number;

  perc = 0;

  score = 0;

  penta: boolean;

  square: boolean;

  triangle: boolean;

  coinWorkers: Map<string, any> = new Map();

  arbs = 0;

  results: Map<
    string,
    {
      score: number;
      arbs: number;
      markets: number;
      paths: number;
      startAmount: number;
      failed: number;
      profit: number;
    }
  > = new Map();

  arbTypes: Map<number, string> = new Map([
    [23, 'triangle'],
    [24, 'square'],
    [25, 'penta']
  ]);

  constructor(
    baseCoins: string[],
    fee: number,
    tradeSize: number,
    threshold: number,
    triangle = true,
    square = true,
    penta = true
  ) {
    this.baseCoins = baseCoins;
    this.fee = fee;
    this.triangle = triangle;
    this.square = square;
    this.penta = penta;
    this.tradeSize = tradeSize;
    this.threshold = threshold;
  }

  getCoinAmountFromUsd = (markets: Map<string, Market>, coin: string, usd: number) => {
    if (coin == 'USDT') return +usd.toFixed(2);

    const market = markets.get(`${coin}USDT`);
    if (market == undefined) return +usd.toPrecision(2);
    return +(usd / market.bid).toFixed(market.lotPrecision);
  };

  coinToUsd = (markets: Map<string, Market>, coin: string, amount: number) => {
    if (coin === 'USDT') return +amount.toFixed(2);
    const market = markets.get(`${coin}USDT`);
    if (market === undefined) return +amount.toPrecision(2);
    return +(amount * market.bid).toFixed(market.lotPrecision);
  };

  roundLot = (markets: Map<string, Market>, coin: string, amount: number) => {
    if (coin === 'USDT') return +amount.toFixed(2);
    const market = markets.get(`${coin}USDT`);
    if (market === undefined) return +amount.toPrecision(2);
    return +amount.toFixed(market.lotPrecision);
  };

  start = async () => {
    const totalTime = new Date().getTime();
    const spinnies = new Spinnies();
    const exchange = new Exchange();
    const markets = await exchange.getMarkets();
    const headerSpinner = new Spinnies({
      disableSpins: true,
      color: 'blue'
    });
    const infoSpinner1 = new Spinnies({
      disableSpins: true
    });
    const infoSpinner2 = new Spinnies({
      disableSpins: true
    });
    const infoSpinner3 = new Spinnies({
      disableSpins: true
    });
    const infoSpinner4 = new Spinnies({
      disableSpins: true
    });
    infoSpinner1.add('inforow', {
      text: ` `
    });
    infoSpinner2.add('info', {
      text: `ARBI`
    });
    infoSpinner3.add('inforow1', {
      text: `     tradeSize: ${this.tradeSize} USD fee: ${this.fee} threshold: ${this.threshold}`
    });
    infoSpinner4.add('inforow1', {
      text: ` `
    });
    headerSpinner.add('header', {
      text: '       SIZE            ARBS           SUCCESS         FAIL        PROFIT',
      color: 'blue'
    });

    for (let i = 0; i < this.baseCoins.length; i++) {
      const startCoin: string = this.baseCoins[i];
      spinnies.add(startCoin, { text: startCoin });
    }

    spinnies.add('last', { text: 'last', spinner: ['-'] });
    for (let i = 0; i < this.baseCoins.length; i++) {
      const startCoin: string = this.baseCoins[i];
      const exchange = new Exchange();
      let startAmount = this.getCoinAmountFromUsd(markets, startCoin, this.tradeSize);
      if (startAmount == undefined) {
        startAmount = +this.tradeSize.toPrecision(8);
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        const arbiWorker = await spawn(new Worker('./workers/arbiWorker'));
        arbiWorker.start(
          startCoin,
          startAmount,
          this.threshold,
          this.fee,
          this.triangle,
          this.square,
          this.penta
        );
        arbiWorker.values().subscribe(({ coin, code, data }) => {
          let res = this.results.get(coin);
          if (res == undefined) {
            res = { score: 0, arbs: 0, markets: 0, paths: 0, startAmount: 0, failed: 0, profit: 0 };
          }
          res.startAmount = startAmount;
          switch (code) {
            case 1:
              res.markets = data;
              this.results.set(coin, res);
              spinnies.update(coin, { text: `${coin} active markets: ${data}` });
              break;
            case 23:
              res.paths += data;
              this.results.set(coin, res);
              spinnies.update(coin, { text: `${coin} triangle arbs: ${data}` });
              break;
            case 24:
              res.paths += data;
              this.results.set(coin, res);
              spinnies.update(coin, { text: `${coin} square arbs: ${data}` });
              break;
            case 25:
              res.paths += data;
              this.results.set(coin, res);
              spinnies.update(coin, { text: `${coin} penta arbs: ${data}` });
              break;
            case 3:
              let txt = fillSpaces(`${coin}`, 7);
              txt += fillSpaces(`${res.startAmount}`, 16);
              txt += fillSpaces(`${res.paths}`, 15);
              txt += fillSpaces(`${res.arbs}`, 16);
              txt += fillSpaces(`${res.failed}`, 12);
              txt += fillSpaces(
                `${this.coinToUsd(markets, coin, res.profit)}/${this.roundLot(
                  markets,
                  coin,
                  res.profit
                )}/${Math.round(res.score * 100) / 100}%`,
                50
              );

              txt += `${data}s`;

              spinnies.update(coin, {
                text: txt
              });
              break;
            case 666:
              // const arb = new Arb(coin, data.score, data.actions, data.string);
              // TODO: purely for dev purposes when not executing the trade to not skew results by counting the same arb multiple times
              // let skip = false;
              // const same = this.arbs.filter((arbOld: Arb) => arb.hash() === arbOld.hash());
              // same.forEach((sameArb: Arb) => {
              //   if (
              //     arb.timestamp - sameArb.timestamp < 100000 &&
              //     Math.abs(sameArb.score - arb.score) < 0.1
              //   ) {
              //     res.failed++;
              //     this.results.set(coin, res);
              //     skip = true;
              //   }
              // });
              const time = new Date().getTime() - totalTime;
              // if (!skip) {
              this.arbs += 1;
              res.score += data.score;
              res.profit += data.profit;
              this.score += data.score;
              res.arbs += 1;
              this.results.set(coin, res);

              spinnies.succeed('last', {
                text: `${Math.round(time / 10 / 60) / 100}min - ${this.arbs} - ${this.score}\n${
                  data.string
                }`
              });
              // } else {
              //   spinnies.fail('last', {
              //     text: `${Math.round(time / 10 / 60) / 100}min - ${this.arbs.length} - ${
              //       this.score
              //     }\n${data.string}`
              //   });
              // }
              break;
            case 3:
              console.log();
              break;
            default:
              break;
          }
        });
        this.coinWorkers.set(startCoin, arbiWorker);
      } catch (e) {
        console.log(e);
      }
    }
  };

  stop = (coin: string) => {
    this.coinWorkers.get(coin)?.finish();
  };
}
