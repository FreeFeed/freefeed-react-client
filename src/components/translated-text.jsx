import ISO6391 from 'iso-639-1';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import { useCallback } from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { initialAsyncState } from '../redux/async-helpers';
import { resetTranslation } from '../redux/action-creators';
import { useServerValue } from './hooks/server-info';
import PieceOfText from './piece-of-text';
import { Icon } from './fontawesome-icons';
import { faTranslate } from './fontawesome-custom-icons';
import { ButtonLink } from './button-link';
import style from './translated-text.module.scss';

const selectTranslationService = (serverInfo) => serverInfo.textTranslation.serviceTitle;

export function TranslatedText({ type, id, userHover, arrowHover, arrowClick, showMedia }) {
  const key = `${type}:${id}`;
  const dispatch = useDispatch();
  const status = useSelector((store) => store.translationStates[key] ?? initialAsyncState);
  const result = useSelector((store) => store.translationResults[key]);
  const serviceTitle = useServerValue(selectTranslationService, false);
  const reset = useCallback(() => dispatch(resetTranslation({ type, id })), [dispatch, id, type]);

  if (status.initial) {
    return null;
  }
  if (status.loading) {
    return (
      <Layout
        status={`Translating using ${serviceTitle}...`}
        inComment={type === 'comment'}
        reset={reset}
      />
    );
  }
  if (status.error) {
    return (
      <Layout
        isError
        status={`Translation error: ${status.errorText}`}
        inComment={type === 'comment'}
        reset={reset}
      />
    );
  }

  return (
    <Layout
      status={`Translated from ${ISO6391.getName(result.detectedLang)} using ${serviceTitle}:`}
      inComment={type === 'comment'}
      reset={reset}
    >
      <PieceOfText
        isExpanded
        text={result.translatedText}
        userHover={userHover}
        arrowHover={arrowHover}
        arrowClick={arrowClick}
        showMedia={showMedia}
      />
    </Layout>
  );
}

function Layout({ status, isError = false, inComment = false, reset, children }) {
  return (
    <div className={cn(style.box, inComment && style.inComment)}>
      <div className={cn(style.status, isError && style.statusError)}>
        <span className={style.icon}>
          <Icon icon={faTranslate} />
        </span>
        <span className={style.statusText}>{status}</span>
        <ButtonLink onClick={reset} aria-label="Close" className={style.closeIcon}>
          <Icon icon={faTimes} />
        </ButtonLink>
      </div>
      <div>{children}</div>
    </div>
  );
}
