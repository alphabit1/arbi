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
});
