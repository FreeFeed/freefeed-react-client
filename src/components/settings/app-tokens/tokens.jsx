import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';

import { faLaptop } from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { getAppTokens } from '../../../redux/action-creators';
import { Icon } from '../../fontawesome-icons';
import { withLayout } from './layout';
import TokenRow from './token-row';

export default withLayout('Application tokens', function Tokens() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.appTokens.tokensStatus);
  const tokenIds = useSelector((state) => state.appTokens.tokenIds);

  useEffect(() => void dispatch(getAppTokens()), [dispatch]);

  if (status.loading || status.initial) {
    return <p>Loading...</p>;
  }

  if (status.error) {
    return <div className="alert alert-danger">Can not load tokens: {status.errorText}</div>;
  }

  return (
    <>
      <p>
        Application tokens let you grant partial access to your account and its data to third-party
        applications. You can revoke this access at any time. Do not share your account password
        with other people and don&apos;t enter it on other websites.
      </p>
      <p>
        <Link className="btn btn-default" to="/settings/app-tokens/create">
          Generate new token
        </Link>
      </p>
      {tokenIds.length === 0 && <p>You have no application tokens yet.</p>}
      <div className="list-group">
        {tokenIds.map((id) => (
          <TokenRow key={id} id={id} />
        ))}
      </div>
      <p>
        <Icon icon={faQuestionCircle} />{' '}
        <Link to="/settings/app-tokens/scopes">About token access rights and scopes</Link>
      </p>
      <p>
        <Icon icon={faLaptop} /> For developers:{' '}
        <Link to="/settings/app-tokens/create-link">Create a magic link</Link>
      </p>
    </>
  );
});
