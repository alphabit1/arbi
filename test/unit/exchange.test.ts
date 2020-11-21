import { expect } from 'chai';
import { describe, it } from 'mocha';
import Exchange from '../../src/Exchange';
import Market from '../../src/Market';

describe('Exchange', () => {
  describe('get all markets', () => {
    it('should return all trading markets', async () => {
      const exchange = new Exchange();
      const result: Map<string, Market> = await exchange.getMarkets();
      expect(result.size).to.be.greaterThan(10);
      expect(result.get('LTCBTC')).to.be.instanceOf(Market);
    }).timeout(150000);
    it('should return all DEV trading markets', async () => {
      const exchange = new Exchange();
      const result: Map<string, Market> = await exchange.getMarkets(true);
      expect(result.size).to.equal(5);
      expect(result.get('LTCBTC')).to.be.instanceOf(Market);
    });
  });

  describe('get all symbols', () => {
    it('should return all trading symbols', async () => {
      const exchange = new Exchange();
      const result: any[] = await exchange.getAllSymbols();
      expect(result.length).to.be.greaterThan(10);
      expect(result[0]).to.haveOwnProperty('symbol');
    }).timeout(150000);
    it('should return all DEV trading symbols', async () => {
      const exchange = new Exchange();
      const result: any[] = await exchange.getAllSymbols(true);
      expect(result.length).to.equal(6);
      expect(result[0]).to.haveOwnProperty('symbol');
    });
  });

  describe('start WS', () => {
    it('should start WS and call ticker callback', done => {
      const exchange = new Exchange();
      exchange.startWs((data: any) => {
        expect(data).to.be.a('array');
        expect(data.length).to.be.greaterThan(1);
        expect(data[0]).to.haveOwnProperty('bestBid');
        expect(data[0]).to.haveOwnProperty('bestBidQuantity');
        expect(data[0]).to.haveOwnProperty('bestAskPrice');
        expect(data[0]).to.haveOwnProperty('bestAskQuantity');
        exchange.websocket.close();
        done();
      });
    }).timeout(15000);
  });
});
