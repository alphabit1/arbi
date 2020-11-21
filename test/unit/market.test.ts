import { doesNotMatch } from 'assert';
import { expect, should } from 'chai';
import { time } from 'console';
import { describe, it } from 'mocha';
import Market from '../../src/Market';

describe('Market ', () => {
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
  it('should update bid ask and call listener', done => {
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
      expect(market.bid).to.eq(2);
      expect(market.ask).to.eq(3);
      expect(market.bidQuantity).to.eq(4);
      expect(market.askQuantity).to.eq(5);
      done();
    });
    market.update({
      bestBid: 2,
      bestAskPrice: 3,
      bestBidQuantity: 4,
      bestAskQuantity: 5
    });
  });

  it('should not update bid ask and not call listener if no change', done => {
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
    let timeout: any;
    market.addListener(() => {
      clearTimeout(timeout);
      done(new Error('listener was called'));
    });

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
    timeout = setTimeout(() => {
      done();
    }, 1000);
  });

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
