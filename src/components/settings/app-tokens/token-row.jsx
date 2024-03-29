import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import { trim } from 'lodash-es';
import { faRedo, faExclamationTriangle, faTrash } from '@fortawesome/free-solid-svg-icons';

import {
  reissueAppToken,
  deleteAppToken,
  deleteAppTokenId,
  updateAppToken,
} from '../../../redux/action-creators';
import { Icon } from '../../fontawesome-icons';
import TimeDisplay from '../../time-display';
import { ButtonLink } from '../../button-link';
import { TextCopier } from './text-copier';

import styles from './token-row.module.scss';

export default function TokenRow({ id }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.appTokens.tokens[id]);
  const scopes = useSelector((state) => state.appTokens.scopes);

  const onReissue = useCallback(
    (tokenId) => () =>
      confirm(
        'Are you sure you want to reissue this token?\nThe previously issued token will stop working immediately!',
      ) && dispatch(reissueAppToken(tokenId)),
    [dispatch],
  );
  const onDelete = useCallback(
    (tokenId) => () =>
      confirm(
        'Are you sure you want to ⚠DELETE⚠ this token?\nToken will stop working immediately!',
      ) && dispatch(deleteAppToken(tokenId)),
    [dispatch],
  );
  const onEdit = useCallback(() => {
    const title = prompt('Enter new token title:', token.title);
    if (title === null || trim(title) === '') {
      return;
    }
    dispatch(updateAppToken(token.id, { title }));
  }, [dispatch, token.id, token.title]);

  const rootEl = useRef();
  useEffect(() => {
    const el = rootEl.current;
    const handler = ({ target }) => target === el && dispatch(deleteAppTokenId(token.id));
    el && el.addEventListener('transitionend', handler);
    return () => el && el.removeEventListener('transitionend', handler);
  }, [dispatch, token.id]);

  const scopesTexts = useMemo(
    () =>
      token.scopes.map((s) => {
        const scope = scopes.find(({ name }) => name === s);
        return scope ? scope.title.toLowerCase() : s;
      }),
    [token.scopes, scopes],
  );

  return (
    <div className={cn('list-group-item', token.deleted && styles.deleted)} ref={rootEl}>
      <div className="btn-group pull-right btn-group-sm" role="group">
        <button className="btn btn-default" title="Reissue token" onClick={onReissue(token.id)}>
          <Icon icon={faRedo} />
        </button>
        <button className="btn btn-default" title="Delete token" onClick={onDelete(token.id)}>
          <Icon icon={faTrash} />
        </button>
      </div>

      <p>
        <strong>{token.title}</strong> (<ButtonLink onClick={onEdit}>rename</ButtonLink>)
      </p>
      <div className="small text-muted">
        <p className={styles.allowsBlock}>{scopesTexts.join(', ')}</p>
        <p className={styles.fromBlock}>
          {[...token.restrictions.netmasks, ...token.restrictions.origins].join('; ')}
        </p>
      </div>
      {token.lastUsedAt ? (
        <p>
          Last used <TimeDisplay timeStamp={token.lastUsedAt} inline /> from IP address{' '}
          <samp>{token.lastIP}</samp>
        </p>
      ) : (
        <p>Never used</p>
      )}

      {token.tokenString && (
        <div className="alert alert-success">
          <p>Here is the reissued token, make sure to copy it now:</p>
          <TextCopier text={token.tokenString} />
        </div>
      )}
      {token.error && (
        <p className="text-danger">
          <Icon icon={faExclamationTriangle} /> {token.error}
        </p>
      )}
    </div>
  );
}
