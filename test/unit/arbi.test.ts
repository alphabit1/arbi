import { expect } from 'chai';
import { describe, it } from 'mocha';
import Arbi from '../../src/Arbi';

describe('temp test', () => {
  it('should run and stop', async () => {
    let arbi = new Arbi(['LTC'], 0.075);
    await arbi.init(false);
    arbi.start();
    arbi.stop();
    expect(arbi).to.be.instanceOf(Arbi);
  }).timeout(150000);
});
