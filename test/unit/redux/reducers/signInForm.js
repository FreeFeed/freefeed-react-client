import { describe, it } from 'mocha';
import expect from 'unexpected';

import { signInForm } from '../../../../src/redux/reducers';
import { signInChange } from '../../../../src/redux/action-creators';

describe('signInForm()', () => {
  it('should change username on signInChange', () => {
    const oldName = 'name';
    const newName = `${oldName}2`;

    const result = signInForm({ username: oldName }, signInChange(newName));

    expect(result, 'to satisfy', { username: newName });
  });

  it('should change password and preserve username on signInChange', () => {
    const username = 'name';
    const password = 'password';

    const result = signInForm({ username }, signInChange(undefined, password));

    expect(result, 'to satisfy', { username, password });
  });
});
