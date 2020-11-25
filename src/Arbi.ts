/*
 * Copyright (c) 2020 AlphaBit
 *
 * Author: DonkeyCoin
 */
import pino from 'pino';
import * as ccxt from 'ccxt';
import PathFinder from './PathFinder';
import Arb from './Arb';

export interface ArbiConfig {
  exchange: string;
  minimumTradeSize: number;
  threshold: number;
  triangle: boolean;
  square: boolean;
  penta: boolean;
  baseCoins: string[];
  apiKey: string;
  apiSecret: string;
}

export default class Arbi {
  config: ArbiConfig;

  log: pino.Logger;

  exchange: ccxt.Exchange;

  activeMarkets: { [id: string]: ccxt.Market } = {};

  constructor(config: ArbiConfig, log: pino.Logger) {
    this.log = log;
    this.config = config;
    this.log.debug(this.config);
    // const ExchangeClass: ccxt.Exchange = new ccxt[config.exchange]();
    // eslint-disable-next-line new-cap
    this.exchange = new ccxt.binance({
      apiKey: config.apiKey,
      secret: config.apiSecret,
      timeout: 30000,
      enableRateLimit: true
    });
  }

  start = async (): Promise<void> => {
    await this.exchange.loadMarkets();
    Object.keys(this.exchange.markets).forEach((symbol: string) => {
      const market = this.exchange.markets[symbol];
      if (market.active) {
        this.activeMarkets[symbol] = market;
      }
    });

    this.log.info(
      `${Object.keys(this.exchange.markets).length} total ${
        Object.keys(this.activeMarkets).length
      } active markets`
    );

    const finder = new PathFinder(this.activeMarkets);
    for (let i = 0; i < this.config.baseCoins.length; i += 1) {
      const coin = this.config.baseCoins[i];
      let arbs: Arb[] = [];
      if (this.config.triangle) {
        arbs = arbs.concat(finder.findTriangle(coin));
      }
      if (this.config.square) {
        arbs = arbs.concat(finder.findSquare(coin));
      }
      if (this.config.penta) {
        //   arbs = arbs.concat(finder.findPenta(coin));
      }
      console.log(arbs.length);
    }
  };
}
