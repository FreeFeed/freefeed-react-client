import { parse as queryParse } from 'querystring';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

  const initialData = useMemo(() => {
    const state = initialFormData;
    if (location.search) {
      const qs = queryParse(location.search.substr(1));
      state.title = qs.title || '';
      state.scopes = (qs.scopes || '').split(/\s+/);
      state.netmasks = qs.netmasks || '';
      state.origins = qs.origins || '';
    }
    return state;
  }, []);

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
          <TextCopier text={createdToken} />
        </div>

        <p>
          <Link to="/settings/app-tokens">
            <Icon icon={faAngleLeft} /> Return to tokens list
          </Link>
        </p>
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
    </form>
  );
});
