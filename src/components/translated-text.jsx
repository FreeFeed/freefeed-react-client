import ISO6391 from 'iso-639-1';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { initialAsyncState } from '../redux/async-helpers';
import { resetTranslation } from '../redux/action-creators';
import { useServerValue } from './hooks/server-info';
import PieceOfText from './piece-of-text';
import { faTranslate } from './fontawesome-custom-icons';
import { AlternativeText } from './alternative-text';

const selectTranslationService = (serverInfo) => serverInfo.textTranslation.serviceTitle;

export function TranslatedText({ type, id, userHover, arrowHover, arrowClick }) {
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
      <AlternativeText
        icon={faTranslate}
        status={`Translating using ${serviceTitle}...`}
        inComment={type === 'comment'}
        close={reset}
      />
    );
  }
  if (status.error) {
    return (
      <AlternativeText
        icon={faTranslate}
        status={`Translation error: ${status.errorText}`}
        inComment={type === 'comment'}
        close={reset}
      />
    );
  }

  return (
    <AlternativeText
      icon={faTranslate}
      status={`Translated from ${ISO6391.getName(result.detectedLang)} using ${serviceTitle}:`}
      inComment={type === 'comment'}
      close={reset}
    >
      <PieceOfText
        isExpanded
        text={result.translatedText}
        userHover={userHover}
        arrowHover={arrowHover}
        arrowClick={arrowClick}
      />
    </AlternativeText>
  );
}
