/* global CONFIG */
import { useCallback, useMemo, useEffect } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useSelector } from 'react-redux';
import { withRouter } from 'react-router';

import { CheckboxInput, RadioInput } from './form-utils';
import styles from './search-form-advanced.module.scss';
import { useSearchQuery } from './hooks/search-query';

const SCOPE_ALL = 'all';
const SCOPE_BODY = 'body';
const SCOPE_COMMENTS = 'comments';

export const SearchFormAdvanced = withRouter(function SearchFormAdvanced({ router }) {
  const isAuthorized = useSelector((state) => !!state.user.id);
  const queryString = useSearchQuery();

  const form = useForm(
    useMemo(
      () => ({
        initialValues: parseQuery(queryString),
        onSubmit: (values) => {
          const q = generateQuery(values);
          q && router.push(`/search?q=${encodeURIComponent(q)}`);
        },
      }),
      [router, queryString],
    ),
  );

  const query = useField('query', form.form);
  const inBody = useField('inBody', form.form);
  const inComments = useField('inComments', form.form);
  const postsFilter = useField('filter', form.form);
  const inMy = useField('inMy', form.form);
  const inFeeds = useField('in', form.form);
  const fromUsers = useField('from', form.form);
  const commentedBy = useField('commentedBy', form.form);
  const likedBy = useField('likedBy', form.form);

  const scope = useMemo(() => {
    if (inBody.input.value && !inComments.input.value) {
      return SCOPE_BODY;
    } else if (!inBody.input.value && inComments.input.value) {
      return SCOPE_COMMENTS;
    }
    return SCOPE_ALL;
  }, [inBody.input.value, inComments.input.value]);

  // author:me isnt available in in-body: scope, so selecting from:me
  useEffect(() => {
    if (scope === SCOPE_BODY && postsFilter.input.value === 'author:me') {
      postsFilter.input.onChange('from:me');
    }
  }, [scope, postsFilter.input]);

  const txt = useCallback(
    (inAllText, inBodyText, inCommentsText) => {
      if (scope === SCOPE_BODY) {
        return inBodyText;
      } else if (scope === SCOPE_COMMENTS) {
        return inCommentsText;
      }
      return inAllText;
    },
    [scope],
  );

  const resultingQuery = generateQuery(form.values);

  return (
    <div>
      <form onSubmit={form.handleSubmit}>
        <div className={`${styles.queryInputGroup} input-group`}>
          <input type="search" name="q" className="form-control" {...query.input} />
          <span className="input-group-btn">
            <button className="btn btn-primary" type="submit" disabled={form.hasValidationErrors}>
              Search
            </button>
          </span>
        </div>
        <div className={styles.options}>
          <div className="input-group">
            Search in{' '}
            <label className={styles.inline}>
              <CheckboxInput field={inBody} /> posts
            </label>
            <label className={styles.inline}>
              <CheckboxInput field={inComments} /> comments
            </label>
          </div>
          <p>Where to search:</p>
          <div className="input-group">
            <label>
              <RadioInput field={postsFilter} value="" /> All {CONFIG.siteTitle}
            </label>
          </div>
          {isAuthorized && (
            <>
              <div className="input-group">
                <label>
                  <RadioInput field={postsFilter} value="in-my:friends" /> My friends and groups
                </label>
              </div>
              <div className="input-group">
                <label>
                  <RadioInput field={postsFilter} value="from:me" /> My posts
                </label>
              </div>
              {scope !== SCOPE_BODY && (
                <div className="input-group">
                  <label>
                    <RadioInput field={postsFilter} value="author:me" />{' '}
                    {txt(
                      'Content of posts and comments written by me',
                      'UNSUPPORTED',
                      'Comments written by me',
                    )}
                  </label>
                </div>
              )}
              <div className="input-group">
                <label>
                  <RadioInput field={postsFilter} value="in-my:" /> My{' '}
                  <select {...inMy.input}>
                    <option value="discussions">Discussions</option>
                    <option value="saves">Saved posts</option>
                    <option value="directs">Direct messages</option>
                  </select>
                </label>
              </div>
            </>
          )}
          <div className="input-group">
            <label>
              <RadioInput field={postsFilter} value="in:" /> Specific users / groups{' '}
              <input type="text" placeholder="user1, group2" {...inFeeds.input} />
            </label>
          </div>
          <div className="input-group">
            <label>
              <RadioInput field={postsFilter} value="from:" /> Posts written by users{' '}
              <input type="text" placeholder="user1, user2" {...fromUsers.input} />
            </label>
          </div>
          <div className="input-group">
            <label>
              <RadioInput field={postsFilter} value="commented-by:" /> Posts commented by{' '}
              <input type="text" placeholder="user1, user2" {...commentedBy.input} />
            </label>
          </div>
          <div className="input-group">
            <label>
              <RadioInput field={postsFilter} value="liked-by:" /> Posts liked by{' '}
              <input type="text" placeholder="user1, user2" {...likedBy.input} />
            </label>
          </div>
        </div>
      </form>
      {resultingQuery && (
        <p>
          Search query: <code>{resultingQuery}</code>
        </p>
      )}
      <p>
        Use double-quotes to search words in the exact form and specific word order:{' '}
        <em>&quot;freefeed version&quot;</em>
        <br />
        Use the asterisk symbol (<code>*</code>) to search word by prefix: <em>free*</em>. The
        minimum prefix length is two characters.
        <br />
        Use the pipe symbol (<code>|</code>) between words to search any of them:{' '}
        <em>freefeed | version</em>
        <br />
        Use the minus sign (<code>-</code>) to exclude some word from search results:{' '}
        <em>freefeed -version</em>
        <br />
        Use the plus sign (<code>+</code>) to specify word order: <em>freefeed + version</em>
        <br />
      </p>
      <p>
        Learn the{' '}
        <a href="https://github.com/FreeFeed/freefeed-server/wiki/FreeFeed-Search" target="_blank">
          full query syntax
        </a>{' '}
        for more advanced search requests.
      </p>
    </div>
  );
});

function usernames(text = '') {
  text = text.toLowerCase();
  const re = /[a-z\d-]+/g;
  let m;
  const result = [];
  while ((m = re.exec(text))) {
    result.push(m[0]);
  }
  return result.join(',');
}

function generateQuery(values) {
  const scope =
    values.inBody && !values.inComments
      ? SCOPE_BODY
      : !values.inBody && values.inComments
        ? SCOPE_COMMENTS
        : SCOPE_ALL;

  const parts = [];
  scope === SCOPE_BODY && parts.push('in-body:');
  scope === SCOPE_COMMENTS && parts.push('in-comments:');
  const { filter } = values;
  switch (filter) {
    case 'in-my:friends':
    case 'from:me':
    case 'author:me':
      parts.push(filter);
      break;
    case 'in-my:':
      parts.push(filter + values.inMy);
      break;
    case 'in:': {
      const v = usernames(values.in);
      v && parts.push(filter + v);
      break;
    }
    case 'from:': {
      const v = usernames(values.from);
      v && parts.push(filter + v);
      break;
    }
    case 'commented-by:': {
      const v = usernames(values.commentedBy);
      v && parts.push(filter + v);
      break;
    }
    case 'liked-by:': {
      const v = usernames(values.likedBy);
      v && parts.push(filter + v);
      break;
    }
  }
  parts.push(values.query.trim());
  return parts.filter(Boolean).join(' ');
}

function parseQuery(query) {
  const values = {
    query: query.trim(),
    inBody: true,
    inComments: true,
    filter: '',
    inMy: 'discussions',
    inFeeds: '',
    from: '',
    commentedBy: '',
    likedBy: '',
  };

  if (values.query === '') {
    return values;
  }

  const trimFirstWord = () => (values.query = values.query.replace(/^\S+\s+/, ''));

  if (/^in-body:\s+/.test(values.query)) {
    values.inComments = false;
    trimFirstWord();
  } else if (/^in-comments:\s+/.test(values.query)) {
    values.inBody = false;
    trimFirstWord();
  }

  let m = /^(in-my:friends|from:me|author:me)\b/.exec(values.query);
  if (m) {
    values.filter = m[1]; // eslint-disable-line prefer-destructuring
    trimFirstWord();
    return values;
  }

  m = /^(in-my:)(discussions|saves|directs)\b/.exec(values.query);
  if (m) {
    [, values.filter, values.inMy] = m;
    trimFirstWord();
    return values;
  }

  m = /^(in:|from:|commented-by:|liked-by:)(\S+)\s+/.exec(values.query);
  if (m) {
    values.filter = m[1]; // eslint-disable-line prefer-destructuring
    values[kebabToCamel(m[1].replace(':', ''))] = m[2].replace(',', ', ');
    trimFirstWord();
    return values;
  }

  return values;
}

function kebabToCamel(text) {
  return text
    .split('-')
    .map((w, i) => (i ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join('');
}
