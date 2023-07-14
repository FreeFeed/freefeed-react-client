import ISO6391 from 'iso-639-1';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { ButtonLink } from '../button-link';
import styles from '../dropdown-menu.module.scss';
import { faTranslate } from '../fontawesome-custom-icons';
import { useServerValue } from '../hooks/server-info';
import { translateText } from '../../redux/action-creators';
import { MenuItemIconic } from './menu-item-iconic';

const selectTranslationEnabled = (serverInfo) => serverInfo.textTranslation.enabled;

export function MenuItemTranslate({ type, id, doAndClose }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const translationEnabled = useServerValue(selectTranslationEnabled, false);
  const targetLang = useMemo(() => {
    let code = user.frontendPreferences.translateToLang;
    if (!code) {
      code = navigator.language?.slice(0, 2) ?? '';
    }
    if (!ISO6391.validate(code)) {
      code = 'en';
    }
    return { code, name: ISO6391.getName(code) };
  }, [user.frontendPreferences.translateToLang]);
  const doTranslate = useCallback(() => {
    dispatch(translateText({ type, id, lang: targetLang.code }));
  }, [dispatch, id, targetLang.code, type]);

  return (
    !!user.id &&
    translationEnabled && (
      <div className={styles.item} key="translate">
        <ButtonLink className={styles.link} onClick={doAndClose(doTranslate)}>
          <MenuItemIconic icon={faTranslate}>Translate to {targetLang.name}</MenuItemIconic>
        </ButtonLink>
      </div>
    )
  );
}
