import { describe, it } from 'mocha';
import expect from 'unexpected';
import { setAppVersion } from '../../../../src/redux/action-creators';
import { appUpdated } from '../../../../src/redux/reducers';

describe(`appUpdated reducer`, () => {
  const s0 = appUpdated(undefined, { type: 'test/init' });

  it(`should return the default state without actions`, () => {
    expect(s0, 'to satisfy', { version: null, updated: false });
  });

  it(`should store the version in the state`, () => {
    const s1 = appUpdated(s0, setAppVersion('v1'));
    expect(s1, 'to satisfy', { version: 'v1', updated: false });
  });

  it(`should not change store when the version in the same`, () => {
    const s1 = appUpdated(s0, setAppVersion('v1'));
    const s2 = appUpdated(s1, setAppVersion('v1'));
    expect(s1, 'to be', s2);
  });

  it(`should mark version updated when the version in changed`, () => {
    const s1 = appUpdated(s0, setAppVersion('v1'));
    const s2 = appUpdated(s1, setAppVersion('v2'));
    expect(s2, 'to satisfy', { version: 'v2', updated: true });
  });

  it(`should keep version updated when the changed version is repeated`, () => {
    const s1 = appUpdated(s0, setAppVersion('v1'));
    const s2 = appUpdated(s1, setAppVersion('v2'));
    const s3 = appUpdated(s2, setAppVersion('v2'));
    expect(s3, 'to satisfy', { version: 'v2', updated: true });
  });
});
