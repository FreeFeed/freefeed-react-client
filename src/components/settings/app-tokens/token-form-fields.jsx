import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uniq, without } from 'lodash';

import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { getAppTokensScopes } from '../../../redux/action-creators';
import { Icon } from '../../fontawesome-icons';

export const initialFormData = {
  title: '',
  scopes: [],
  netmasks: '',
  origins: '',
};

export default function TokenForm({ initialData = initialFormData, onChange }) {
  const dispatch = useDispatch();
  const scopesStatus = useSelector((state) => state.appTokens.scopesStatus);
  const scopes = useSelector((state) => state.appTokens.scopes);

  useEffect(
    () => void (scopesStatus.success || scopesStatus.loading || dispatch(getAppTokensScopes())),
    [dispatch, scopesStatus],
  );

  const [form, setForm] = useState(initialData);
  useEffect(() => void (onChange && onChange(form)), [form, onChange]);

  const handleChange = useCallback(({ target }) => {
    if (['title', 'netmasks', 'origins'].includes(target.name)) {
      setForm((f) => ({ ...f, [target.name]: target.value }));
    }
    if (target.name === 'scope') {
      if (target.checked) {
        setForm((f) => ({ ...f, scopes: uniq([...f.scopes, target.value]) }));
      } else {
        setForm((f) => ({ ...f, scopes: without(f.scopes, target.value) }));
      }
    }
  }, []);

  const [restrictions, showRestrictions] = useState(form.netmasks !== '' || form.origins !== '');
  const showRestrictionsClick = useCallback(() => showRestrictions(true), []);

  if (scopesStatus.loading) {
    return <p>Loading...</p>;
  }

  if (scopesStatus.error) {
    return <div className="alert alert-danger">Can not load scopes: {scopesStatus.error}</div>;
  }

  return (
    <>
      <div className="form-group">
        <label htmlFor="title-input">Token title</label>
        <input
          type="text"
          name="title"
          className="form-control"
          id="title-input"
          maxLength="250"
          value={form.title}
          onChange={handleChange}
          placeholder="What is this token for?"
        />
      </div>
      <div className="form-group">
        <label htmlFor="title-input">Allow token to</label>
        <div className="checkbox">
          <label>
            <input type="checkbox" name="scope" value="" checked disabled /> Read my public profile{' '}
            <em>(always available)</em>
          </label>
        </div>
        {scopes.map((scope) => (
          <div key={scope.name} className="checkbox">
            <label>
              <input
                type="checkbox"
                name="scope"
                value={scope.name}
                checked={form.scopes.includes(scope.name)}
                onChange={handleChange}
              />{' '}
              {scope.title}
            </label>
          </div>
        ))}
      </div>
      {restrictions ? (
        <>
          <div className="form-group">
            <label htmlFor="netmasks-input">Allow requests from these IPs or networks only</label>
            <input
              type="text"
              name="netmasks"
              className="form-control"
              id="netmasks-input"
              value={form.netmasks}
              onChange={handleChange}
              placeholder="127.0.0.1 192.168.0.0/16"
            />
            <div className="help-block">Optional, use space to separate multiple values</div>
          </div>
          <div className="form-group">
            <label htmlFor="origins-input">Allow CORS requests from these origins only</label>
            <input
              type="text"
              name="origins"
              className="form-control"
              id="origins-input"
              value={form.origins}
              onChange={handleChange}
              placeholder="https://hostname"
            />
            <div className="help-block">Optional, use space to separate multiple values</div>
          </div>
        </>
      ) : (
        <div className="form-group help-block">
          <a onClick={showRestrictionsClick}>
            <Icon icon={faCaretRight} /> Set additional restrictions
          </a>{' '}
          (optional)
        </div>
      )}
    </>
  );
}
