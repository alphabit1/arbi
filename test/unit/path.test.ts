import { expect } from 'chai';
import { describe, it } from 'mocha';
import Market from '../../src/Market';
import Path from '../../src/Path';

describe('Path ', () => {
  let path: Path;
  it('should create path object', () => {
    path = new Path('BTC');
    expect(path).to.be.instanceOf(Path);
  });

  it('should add a market', () => {
    let result = path.addMarket(
      new Market(
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
      )
    );
    expect(path.markets).to.be.lengthOf(1);
    expect(result).to.be.instanceOf(Path);
  });

  it('should return path string', () => {
    let str = path
      .addMarket(
        new Market(
          {
            symbol: 'LTCBTC',
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
        )
      )
      .toString();
    expect(str).to.equal('XTCBTC LTCBTC');
  });
  // sell BTCUSDT @ 18830.41000000 : 1 * 18830,41 - (18830,41 / 100) * 0,075 = 18.816,2871925
  // buy BNBUSDT @ 28.94420000 : 18.816,2871925 / 28,9442 - (650,0883490475 / 100) * 0,075 = 649,6007827857
  // buy KP3RBNB @ 7.54900000 : 649,6007827857 / 7,54900000 - (86,0512362943 / 100) * 0,075 = 85,9866978671
  // sell KP3RBUSD @ 219.72000000 : 85,9866978671 * 219,72000000 - (18.892,9972553592 / 100) * 0,075 = 18.878,8275074177
  // buy BTCBUSD @ 18845.6900000 : 18.878,8275074177 / 18845,6900000 - (1,00175836 / 100) * 0,075 = 1,0010070412
  // 1,0010070412 - 1 = 0,0010070412
  // (0,0010070412 / 1) * 100 = 0,10070412
  it('should calculate score', () => {
    path = new Path('BTC');
    path.addMarket(
      new Market(
        {
          symbol: 'BTCUSDT',
          status: 'TRADING',
          baseAsset: 'BTC',
          quoteAsset: 'USDT'
        },
        {
          bidPrice: 18830.41,
          bidQty: 1,
          askPrice: 1,
          askQty: 1
        }
      )
    );
    path.addMarket(
      new Market(
        {
          symbol: 'BNBUSDT',
          status: 'TRADING',
          baseAsset: 'BNB',
          quoteAsset: 'USDT'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 28.9442,
          askQty: 1
        }
      )
    );
    path.addMarket(
      new Market(
        {
          symbol: 'KP3RBNB',
          status: 'TRADING',
          baseAsset: 'KP3R',
          quoteAsset: 'BNB'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 7.549,
          askQty: 1
        }
      )
    );
    path.addMarket(
      new Market(
        {
          symbol: 'KP3RBUSD',
          status: 'TRADING',
          baseAsset: 'KP3R',
          quoteAsset: 'BUSD'
        },
        {
          bidPrice: 219.72,
          bidQty: 1,
          askPrice: 1,
          askQty: 1
        }
      )
    );
    path.addMarket(
      new Market(
        {
          symbol: 'BTCBUSD',
          status: 'TRADING',
          baseAsset: 'BTC',
          quoteAsset: 'BUSD'
        },
        {
          bidPrice: 1,
          bidQty: 1,
          askPrice: 18845.69,
          askQty: 1
        }
      )
    );
    expect(path.calculate(0.075).score).to.eq(0.1007);
  });
  it('should check if return false if symbol not in path', () => {
    expect(path.hasSymbol('XXXXXXX')).to.be.false;
  });
});
