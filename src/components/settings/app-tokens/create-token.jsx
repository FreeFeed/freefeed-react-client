import { parse as urlParse } from 'url';
import { parse as queryParse } from 'querystring';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { trim } from 'lodash';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { createAppToken, createAppTokenReset } from '../../../redux/action-creators';
import { Icon } from '../../fontawesome-icons';
import { TextCopier } from './text-copier';
import TokenForm, { initialFormData } from './token-form-fields';
import { withLayout } from './layout';

export default withLayout('Generate new token', function CreateToken() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.appTokens.createStatus);
  const createdToken = useSelector((state) => state.appTokens.createdToken);

  useEffect(() => void dispatch(createAppTokenReset()), [dispatch]);

  const { returnURL, ...initialData } = useMemo(() => {
    const state = { returnURL: '', ...initialFormData };
    if (location.search) {
      const qs = queryParse(location.search.substr(1));
      state.title = qs.title || '';
      state.scopes = (qs.scopes || '').split(/\s+/);
      state.netmasks = qs.netmasks || '';
      state.origins = qs.origins || '';
      state.returnURL = qs.return_url || '';
    }
    return state;
  }, []);

  const [returnDomain, returnHref] = useMemo(() => {
    const url = urlParse(returnURL);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return [url.hostname, url.href];
    }
    return [null, null];
  }, [returnURL]);

  const [form, setForm] = useState(initialData);

  const canSubmit = useMemo(() => !status.loading && trim(form.title) !== '', [
    form,
    status.loading,
  ]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!canSubmit) {
        return;
      }

      const submitData = {
        title: trim(form.title),
        scopes: form.scopes,
        restrictions: { origins: [], netmasks: [] },
      };

      if (trim(form.netmasks)) {
        submitData.restrictions.netmasks = trim(form.netmasks).split(/\s+/);
      }

      if (trim(form.origins)) {
        submitData.restrictions.origins = trim(form.origins).split(/\s+/);
      }

      dispatch(createAppToken(submitData));
    },
    [canSubmit, dispatch, form.netmasks, form.origins, form.scopes, form.title],
  );

  if (status.success) {
    return (
      <>
        <div className="alert alert-success">
          <p className="lead">Success!</p>
          <p>Here is your token. Make sure to copy it now. You won’t be able to see it again!</p>
          <div className="form-group">
            <TextCopier text={createdToken} />
          </div>
          {returnHref && (
            <div className="form-group">
              <a href={returnHref}>
                <Icon icon={faAngleLeft} /> Back to application site
              </a>{' '}
              ({returnDomain})
            </div>
          )}
        </div>

        {!returnHref && (
          <p>
            <Link to="/settings/app-tokens" className="btn btn-default">
              <Icon icon={faAngleLeft} /> Return to tokens list
            </Link>
          </p>
        )}
      </>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {status.error && (
        <div className="alert alert-danger">Can not create token: {status.errorText}</div>
      )}

      <TokenForm initialData={initialData} onChange={setForm} />

      <div className="form-group">
        <button type="submit" className="btn btn-default" disabled={!canSubmit}>
          Generate token
        </button>
      </div>

      <p>
        <Icon icon={faQuestionCircle} />{' '}
        <Link to="/settings/app-tokens/scopes">About token access rights and scopes</Link>
      </p>

      {returnHref && (
        <p>
          <a href={returnHref}>
            <Icon icon={faAngleLeft} /> Back to application site
          </a>{' '}
          ({returnDomain})
        </p>
      )}
    </form>
  );
});
