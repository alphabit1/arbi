import { expect } from 'chai';
import { describe, it } from 'mocha';
import Path from '../../src/Path';

describe('Path ', () => {
  let path: Path;
  it('should create path object', () => {
    path = new Path('BTC');
    expect(path).to.be.instanceOf(Path);
  });

  it('should add a pair', () => {
    let result = path.addPair({
      symbol: 'XTCBTC',
      status: 'TRADING',
      baseAsset: 'XTC',
      quoteAsset: 'BTC'
    });
    expect(path.pairs).to.be.lengthOf(1);
    expect(result).to.be.instanceOf(Path);
  });

  it('should return path string', () => {
    let str = path
      .addPair({
        symbol: 'LTCBTC',
        status: 'TRADING',
        baseAsset: 'XTC',
        quoteAsset: 'BTC'
      })
      .toString();
    expect(str).to.equal('XTCBTC LTCBTC');
  });
});
