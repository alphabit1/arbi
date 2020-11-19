import { expect } from 'chai';
import { describe, it } from 'mocha';
import Exchange, { Pair } from '../../src/Exchange';

describe('get all pairs', () => {
  it('should return all trading pairs', async () => {
    const exchange = new Exchange();
    const result: Pair[] = await exchange.getAllPairs();
    expect(result.length).to.be.greaterThan(10);

    expect(result[0]).to.haveOwnProperty('symbol');
    expect(result[0]).to.haveOwnProperty('status');
    expect(result[0]).to.haveOwnProperty('quoteAsset');
    expect(result[0]).to.haveOwnProperty('baseAsset');
  }).timeout(15000);
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
      exchange.ws.close();
      done();
    });
  }).timeout(15000);
});
