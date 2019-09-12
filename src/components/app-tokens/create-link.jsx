import { stringify } from 'querystring';

import React, { useState } from 'react';
import { Link } from 'react-router';
import { trim } from 'lodash';

import { faAngleRight, faLaptop } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '../fontawesome-icons';
import TokenForm, { initialFormData } from './token-form-fields';
import { TextCopier } from './text-copier';

export default function CreateLink() {
  const [form, setForm] = useState(initialFormData);

  const linkParams = {};
  if (trim(form.title) !== '') {
    linkParams.title = trim(form.title);
  }
  if (form.scopes.length > 0) {
    linkParams.scopes = form.scopes.join(' ');
  }
  if (trim(form.netmasks)) {
    linkParams.netmasks = trim(form.netmasks);
  }
  if (trim(form.origins)) {
    linkParams.origins = trim(form.origins);
  }

  const query = stringify(linkParams);

  return (
    <>
      <p>
        <Icon icon={faLaptop} /> This page is for the application developers.
      </p>
      <p>
        Here you can create a magic link that fully or partially pre-fills the “New application
        token” form for your application users.
      </p>
      <p>
        <Link to="/settings/app-tokens/scopes">
          More about the token access rights and scopes <Icon icon={faAngleRight} />
        </Link>
      </p>

      <TokenForm onChange={setForm} />

      <div className="alert alert-info">
        <p>Share this link with your application users:</p>
        <TextCopier
          text={`${location.origin}/settings/app-tokens/create${query !== '' ? `?${query}` : ''}`}
        />
      </div>
    </>
  );
}
