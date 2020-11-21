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

  describe('get all trio paths', () => {
    it('should return all trio arb paths', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getAllTrio();
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(6);
      expect(paths[0]).to.haveOwnProperty('coin');
    });
  });

  describe('get all quad paths', () => {
    it('should return all quad arb paths', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getAllQuad();
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(4);
      expect(paths[0]).to.haveOwnProperty('coin');
    });
  });

  describe('get all quint paths', () => {
    it('should return all quint arb paths', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getAllQuint();
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(4);
      expect(paths[0]).to.haveOwnProperty('coin');
    });
    it('should return empty array if quint == false', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC'], false);
      const paths: Path[] = finder.getAllQuint();
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

  describe('get all trio paths for coin', () => {
    it('should return all trio arb paths for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinTrio('BTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(4);
      expect(paths[0]).to.haveOwnProperty('coin');
    });

    it('should return empty array if no path for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinTrio('XTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(0);
    });
  });

  describe('get all quad paths for coin', () => {
    it('should return all quad arb paths for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinQuad('BTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(2);
      expect(paths[0]).to.haveOwnProperty('coin');
    });

    it('should return empty array if no path for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinQuad('XTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(0);
    });
  });

  describe('get all quint paths for coin', () => {
    it('should return all quint arb paths for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinQuint('LTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(4);
      expect(paths[0]).to.haveOwnProperty('coin');
    });

    it('should return empty array if quint == false', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC'], false);
      const paths: Path[] = finder.getByCoinQuint('LTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(0);
    });

    it('should return empty array if no path for coin', async () => {
      const finder = new PathFinder(markets, ['BTC', 'LTC']);
      const paths: Path[] = finder.getByCoinQuint('XTC');
      expect(paths).to.be.a('array');
      expect(paths).to.be.lengthOf(0);
    });
  });
});
