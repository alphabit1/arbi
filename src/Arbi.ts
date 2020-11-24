import { spawn, Thread, Worker } from 'threads';
import Spinnies from 'spinnies';
import Exchange from './Exchange';
import Market from './Market';
import Trade from './Trade';
import fs from 'fs';
import { promise } from 'ora';

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

  penta: boolean;

  square: boolean;

  triangle: boolean;

  perc = 0;

  score = 0;

  coinWorkers: Map<string, any> = new Map();

  markets: Map<string, Market> = new Map();

  exchange: Exchange = new Exchange();

  killed = false;

  openOrders: Map<string, any> = new Map();

  results: Map<
    string,
    {
      score: number;
      arbs: number;
      markets: number;
      paths: number;
      failed: number;
      profit: number;
      profitUsd: number;
      status: string;
      current: string;
    }
  > = new Map();
  coinSpinners = new Spinnies();

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
  setupUI = () => {
    const coinSpinner = new Spinnies();
    const headerSpinnerRow1 = new Spinnies({ disableSpins: true });
    headerSpinnerRow1.add('row1', { text: ' ' });
    const headerSpinnerRow2 = new Spinnies({ disableSpins: true });
    headerSpinnerRow2.add('row2', { text: 'ARBI' });
    const headerSpinnerRow3 = new Spinnies({ disableSpins: true });
    headerSpinnerRow3.add('row3', {
      text: `     tradeSize: ${this.tradeSize} USD fee: ${this.fee} threshold: ${this.threshold}`
    });
    const headerSpinnerRow4 = new Spinnies({ disableSpins: true });
    headerSpinnerRow4.add('row1', { text: ' ' });
    const tableHeader = new Spinnies();
    tableHeader.add('header', {
      text:
        '          ARBS           SUCCESS         FAIL        PROFIT (USD/%)                STATUS',
      color: 'blue',
      status: 'non-spinnable'
    });

    for (let i = 0; i < this.baseCoins.length; i++) {
      const startCoin: string = this.baseCoins[i];
      this.coinSpinners.add(startCoin, { text: startCoin });
    }
    this.coinSpinners.add('total', { text: 'TOTAL' });
    this.coinSpinners.add('time', { text: '' });
    this.coinSpinners.add('log', { text: '' });
  };
  start = async () => {
    this.setupUI();

    this.exchange.startUserWs((data: any) => {
      if (data.eventType === 'executionReport' && data.orderStatus === 'FILLED') {
        const resolver = this.openOrders.get(data.newClientOrderId);
        if (resolver !== undefined) {
          this.openOrders.delete(data.newClientOrderId);
          resolver.resolve();
        }
      }
    });

    this.markets = await this.exchange.getMarkets();
    const totalTime = new Date().getTime();
    for (let i = 0; i < this.baseCoins.length; i++) {
      const startCoin: string = this.baseCoins[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        const arbiWorker = await spawn(new Worker('./workers/arbiWorker'));
        arbiWorker.start(
          startCoin,
          this.exchange.usdToCoin(this.markets, startCoin, this.tradeSize),
          this.threshold,
          this.fee,
          this.triangle,
          this.square,
          this.penta
        );
        arbiWorker.values().subscribe(({ coin, code, data }) => {
          if (this.killed) return;
          let res = this.results.get(coin);
          if (res == undefined) {
            res = {
              score: 0,
              arbs: 0,
              markets: 0,
              paths: 0,
              failed: 0,
              profit: 0,
              profitUsd: 0,
              status: 'watching',
              current: ''
            };
          }
          switch (code) {
            case 1:
              res.markets = data;
              this.results.set(coin, res);
              this.coinSpinners.update(coin, { text: `${coin} active markets: ${data}` });
              break;

            case 23:
              res.paths += data;
              this.results.set(coin, res);
              this.coinSpinners.update(coin, { text: `${coin} triangle arbs: ${data}` });
              break;
            case 24:
              res.paths += data;
              this.results.set(coin, res);
              this.coinSpinners.update(coin, { text: `${coin} square arbs: ${data}` });
              break;
            case 25:
              res.paths += data;
              this.results.set(coin, res);
              this.coinSpinners.update(coin, { text: `${coin} penta arbs: ${data}` });
              break;
            case 3:
              let txt = fillSpaces(`${coin}`, 8);
              txt += fillSpaces(`${res.paths}`, 15);
              txt += fillSpaces(`${res.arbs}`, 16);
              txt += fillSpaces(`${res.failed}`, 12);
              txt += fillSpaces(
                `${this.exchange.coinToUsd(this.markets, coin, res.profit)}/${
                  Math.round(res.score * 100) / 100
                }%`,
                30
              );

              txt += fillSpaces(`${res.status}`, 30);
              txt += `${data}s`;
              if (res.current.length > 1) {
                txt += `\n${res.current}\n`;
              }
              this.coinSpinners.update(coin, {
                text: txt
              });
              let totalPaths = 0;
              let totalSuccess = 0;
              let totalFailed = 0;
              let totalScore = 0;
              let totalProfit = 0;
              this.results.forEach((result: any) => {
                totalPaths += result.paths;
                totalSuccess += result.arbs;
                totalFailed += result.failed;
                totalProfit += result.profitUsd;
                totalScore += result.score;
              });
              txt = fillSpaces(`TOTAL`, 8);
              txt += fillSpaces(`${totalPaths}`, 15);
              txt += fillSpaces(`${totalSuccess}`, 16);
              txt += fillSpaces(`${totalFailed}`, 12);
              txt += fillSpaces(`${totalProfit} / ${Math.round(totalScore * 100) / 100}%`, 45);

              this.coinSpinners.update('time', {
                text: `${Math.round((new Date().getTime() - totalTime) / 10 / 60) / 100}min`
              });

              this.coinSpinners.update('total', { text: txt, spinner: { frames: ['-'] } });
              break;
            case 666:
              this.executeArb(coin, data.trades, data.score, data.profit, data.string);
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

  trade = async (trade: Trade) => {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const orderResult = await this.exchange.order(trade);
        this.openOrders.set(orderResult.clientOrderId, { resolve, reject });
      } catch (e) {
        reject(e);
      }
    });
  };

  logSuccess = (str: string) => {
    fs.appendFile('success.txt', str + '\n\n', function (err) {
      if (err) throw err;
    });
  };

  logFail = (str: string) => {
    fs.appendFile('fail.txt', str + '\n\n', function (err) {
      if (err) throw err;
    });
  };

  logBusy = (str: string) => {
    this.logFail('busy\n' + str);
  };

  executeArb = async (
    coin: string,
    trades: Trade[],
    score: number,
    profit: number,
    string: string
  ) => {
    const result = this.results.get(coin);
    if (result == undefined) return;

    if (result.status !== 'watching') {
      result.failed += 1;
      this.results.set(coin, result);
      this.logBusy(string);
      return;
    }
    try {
      result.current = string;
      this.results.set(coin, result);
      for (let i = 0; i < trades.length; i++) {
        const trade = trades[i];
        result.status = `waiting for trade ${i + 1} of ${trades.length} ${trade.type} ${
          trade.symbol
        } ${trade.size} @ ${trade.price} `;
        this.results.set(coin, result);
        const tradeResult = await this.trade(trades[i]);
      }
      result.status = 'watching';
      result.current = '';
      result.score += score;
      result.profit += profit;
      result.profitUsd += this.exchange.coinToUsd(this.markets, coin, profit);
      result.arbs += 1;
      this.logSuccess(`${string}`);
    } catch (e) {
      result.status = 'watching';
      result.failed += 1;
      result.current = '';
      this.logFail(`${e.code} : ${e.msg}\n${string}`);
      this.log(`${e.code} : ${e.msg}\n${string}`);
    }

    this.results.set(coin, result);
  };
  stop = (coin: string) => {
    this.coinWorkers.get(coin)?.finish();
  };
  kill = () => {
    this.coinWorkers.forEach(async (worker: any) => {
      this.killed = true;
      worker.finish();
      await Thread.terminate(worker);
    });
  };

  log = (str: string) => {
    this.coinSpinners.succeed('log', {
      text: `${str}`
    });
  };
}
