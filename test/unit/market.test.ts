import { doesNotMatch } from 'assert';
import { expect, should } from 'chai';
import { assert, time } from 'console';
import { describe, it } from 'mocha';
import Market from '../../src/Market';

describe('Market ', () => {
  describe('constructor ', () => {
    it('should create Market object', () => {
      let market = new Market(
        {
          symbol: 'XTCBTC',
          status: 'TRADING',
          baseAsset: 'XTC',
          quoteAsset: 'BTC'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 1,
          askQty: 1
        }
      );
      expect(market).to.be.instanceOf(Market);
    });
  });
  describe('update ', () => {
    it('should update bid', () => {
      let market = new Market(
        {
          symbol: 'XTCBTC',
          status: 'TRADING',
          baseAsset: 'XTC',
          quoteAsset: 'BTC'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 1,
          askQty: 1
        }
      );
      market.update({
        bestBid: 2,
        bestAskPrice: 1,
        bestBidQuantity: 1,
        bestAskQuantity: 1
      });
      expect(market.bid).to.eq(2);
      expect(market.ask).to.eq(1);
      expect(market.bidQuantity).to.eq(1);
      expect(market.askQuantity).to.eq(1);
      expect(market.updated).to.be.true;
    });
    it('should update ask', () => {
      let market = new Market(
        {
          symbol: 'XTCBTC',
          status: 'TRADING',
          baseAsset: 'XTC',
          quoteAsset: 'BTC'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 1,
          askQty: 1
        }
      );
      market.update({
        bestBid: 1,
        bestAskPrice: 3,
        bestBidQuantity: 1,
        bestAskQuantity: 1
      });
      expect(market.bid).to.eq(1);
      expect(market.ask).to.eq(3);
      expect(market.bidQuantity).to.eq(1);
      expect(market.askQuantity).to.eq(1);
      expect(market.updated).to.be.true;
    });
    it('should update bidQuantity', () => {
      let market = new Market(
        {
          symbol: 'XTCBTC',
          status: 'TRADING',
          baseAsset: 'XTC',
          quoteAsset: 'BTC'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 1,
          askQty: 1
        }
      );
      market.update({
        bestBid: 1,
        bestAskPrice: 1,
        bestBidQuantity: 4,
        bestAskQuantity: 1
      });
      expect(market.bid).to.eq(1);
      expect(market.ask).to.eq(1);
      expect(market.bidQuantity).to.eq(4);
      expect(market.askQuantity).to.eq(1);
      expect(market.updated).to.be.true;
    });
    it('should update askQuantity', () => {
      let market = new Market(
        {
          symbol: 'XTCBTC',
          status: 'TRADING',
          baseAsset: 'XTC',
          quoteAsset: 'BTC'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 1,
          askQty: 1
        }
      );
      market.update({
        bestBid: 1,
        bestAskPrice: 1,
        bestBidQuantity: 1,
        bestAskQuantity: 5
      });
      expect(market.bid).to.eq(1);
      expect(market.ask).to.eq(1);
      expect(market.bidQuantity).to.eq(1);
      expect(market.askQuantity).to.eq(5);
      expect(market.updated).to.be.true;
    });

    it('should not update bid ask if no change', () => {
      let market = new Market(
        {
          symbol: 'XTCBTC',
          status: 'TRADING',
          baseAsset: 'XTC',
          quoteAsset: 'BTC'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 1,
          askQty: 1
        }
      );

      market.update({
        bestBid: 1,
        bestAskPrice: 1,
        bestBidQuantity: 1,
        bestAskQuantity: 1
      });
      expect(market.bid).to.eq(1);
      expect(market.ask).to.eq(1);
      expect(market.bidQuantity).to.eq(1);
      expect(market.askQuantity).to.eq(1);
      expect(market.updated).to.be.false;
    });
  });
  describe('addListener ', () => {
    it('should add a listener', () => {
      let market = new Market(
        {
          symbol: 'XTCBTC',
          status: 'TRADING',
          baseAsset: 'XTC',
          quoteAsset: 'BTC'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 1,
          askQty: 1
        }
      );
      market.addListener(() => 'brrrr');
      expect(market.listeners[0]()).to.eq('brrrr');
    });
  });
  describe('callListeners ', () => {
    it('should call listeners', done => {
      let market = new Market(
        {
          symbol: 'XTCBTC',
          status: 'TRADING',
          baseAsset: 'XTC',
          quoteAsset: 'BTC'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 1,
          askQty: 1
        }
      );
      market.addListener(() => {
        done();
      });
      market.update({
        bestBid: 2,
        bestAskPrice: 3,
        bestBidQuantity: 4,
        bestAskQuantity: 5
      });
      market._callListeners();
    }).timeout(15000);
  });
  it('should not call listeners', () => {
    let market = new Market(
      {
        symbol: 'XTCBTC',
        status: 'TRADING',
        baseAsset: 'XTC',
        quoteAsset: 'BTC'
      },
      {
        bidPrice: 1,
        bidQty: 1,
        askPrice: 1,
        askQty: 1
      }
    );
    market.addListener(() => {
      expect.fail(null, null, 'Listener was called');
    });
    market.update({
      bestBid: 1,
      bestAskPrice: 1,
      bestBidQuantity: 1,
      bestAskQuantity: 1
    });
    market._callListeners();
  }).timeout(15000);
});
