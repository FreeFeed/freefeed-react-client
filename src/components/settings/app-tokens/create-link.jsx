import { stringify } from 'querystring';

import { useState, useCallback } from 'react';
import { faAngleRight, faLaptop } from '@fortawesome/free-solid-svg-icons';

import { Link } from '../../../services/nouter';
import { Icon } from '../../fontawesome-icons';
import TokenForm, { initialFormData } from './token-form-fields';
import { TextCopier } from './text-copier';
import { withLayout } from './layout';

export default withLayout('Create a magic link', function CreateLink() {
  const [form, setForm] = useState(initialFormData);
  const [returnURL, setReturnURL] = useState('');

  const onReturnURLChange = useCallback((e) => setReturnURL(e.target.value), []);

  const linkParams = {};
  if (form.title.trim() !== '') {
    linkParams.title = form.title.trim();
  }
  if (form.scopes.length > 0) {
    linkParams.scopes = form.scopes.join(' ');
  }
  if (form.netmasks.trim()) {
    linkParams.netmasks = form.netmasks.trim();
  }
  if (form.origins.trim()) {
    linkParams.origins = form.origins.trim();
  }
  if (/^https?:\/\//i.test(returnURL.trim())) {
    linkParams.return_url = returnURL.trim();
  }

  const query = stringify(linkParams);

  return (
    <>
      <p>
        <Icon icon={faLaptop} /> This page is for application developers.
      </p>
      <p>
        Here you can create a magic link that fully or partially pre-fills the “New application
        token” form for your application users.
      </p>
      <p>
        <Link to="/settings/app-tokens/scopes">
          More about token access rights and scopes <Icon icon={faAngleRight} />
        </Link>
      </p>

      <TokenForm onChange={setForm} />

      <div className="form-group">
        <p>After creating a token, show this return link to user:</p>
        <input
          type="text"
          name="title"
          className="form-control"
          id="return-url"
          maxLength="500"
          value={returnURL}
          onChange={onReturnURLChange}
          placeholder="https://…"
        />
      </div>

      <div className="alert alert-info">
        <p>Share this link with your application users:</p>
        <TextCopier
          text={`${location.origin}/settings/app-tokens/create${query !== '' ? `?${query}` : ''}`}
        />
      </div>
    </>
  );
});
