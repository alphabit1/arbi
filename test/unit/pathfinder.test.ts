import { expect } from 'chai';
import { describe, it } from 'mocha';
import Exchange from '../../src/Exchange';
import Market from '../../src/Market';
import Path from '../../src/Path';
import PathFinder from '../../src/PathFinder';

let exchange: Exchange;
let markets: Map<string, Market>;

describe('pathfinder', function () {
  before(done => {
    exchange = new Exchange();
    exchange.getMarkets(true).then(res => {
      markets = res;
      done();
    });
  });

  describe('get all paths', () => {
    it('should return all arb paths', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getAll();
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(14);
      expect(paths[0]).to.be.instanceOf(Path);
    });
  });

  describe('get all triangle paths', () => {
    it('should return all triangle arb paths', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getAllTriangle();
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(6);
      expect(paths[0]).to.haveOwnProperty('coin');
    });
  });

  describe('get all square paths', () => {
    it('should return all square arb paths', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getAllSquare();
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(4);
      expect(paths[0]).to.haveOwnProperty('coin');
    });
  });

  describe('get all penta paths', () => {
    it('should return all penta arb paths', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getAllPenta();
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(4);
      expect(paths[0]).to.haveOwnProperty('coin');
    });
    it('should return empty array if penta == false', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC'], false);
      const paths: Path[] = finder.getAllPenta();
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(0);
    });
  });

  describe('get all paths for coin', () => {
    it('should return all arb paths for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoin('BTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(6);
      expect(paths[0]).to.haveOwnProperty('coin');
    });

    it('should return empty array if no path for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoin('xTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(0);
    });
  });

  describe('get all triangle paths for coin', () => {
    it('should return all triangle arb paths for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinTriangle('BTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(4);
      expect(paths[0]).to.haveOwnProperty('coin');
    });

    it('should return empty array if no path for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinTriangle('XTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(0);
    });
  });

  describe('get all square paths for coin', () => {
    it('should return all square arb paths for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinSquare('BTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(2);
      expect(paths[0]).to.haveOwnProperty('coin');
    });

    it('should return empty array if no path for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinSquare('XTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(0);
    });
  });

  describe('get all penta paths for coin', () => {
    it('should return all penta arb paths for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinPenta('LTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(4);
      expect(paths[0]).to.haveOwnProperty('coin');
    });

    it('should return empty array if penta == false', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC'], false);
      const paths: Path[] = finder.getByCoinPenta('LTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(0);
    });

    it('should return empty array if no path for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinPenta('XTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(0);
    });
  });
});
