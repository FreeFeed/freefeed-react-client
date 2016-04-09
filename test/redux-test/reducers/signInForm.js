import test from 'tape';
import {signInForm} from 'src/redux/reducers';
import {signInChange} from 'src/redux/action-creators';

test('signInForm changes username on signInChange', t => {
  const oldName = 'name';
  const newName = oldName + '2';

  const result = signInForm({username:oldName}, signInChange(newName));

  t.equal(result.username, newName);

  t.end();
});

test('signInForm changes password and preserves username on signInChange', t => {
  const username = 'name';
  const password = 'password';

  const result = signInForm({username}, signInChange(undefined, password));

  t.equal(result.username, username);
  t.equal(result.password, password);

  t.end();
});
