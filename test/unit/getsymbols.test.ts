import { expect } from 'chai';
import { describe, it } from 'mocha';
import { calculate } from '../../src/getSymbols';

describe('get all symbols', () => {
  it('should return all symbols', () => {
    const result = calculate();
    expect(result[0]).to.haveOwnProperty('dunno');
  });
});
