import {
  SCHEME_DARK,
  SCHEME_LIGHT,
  SCHEME_NO_PREFERENCE,
  colorSchemeStorageKey,
  hdrImagesStorageKey,
  loadColorScheme,
  loadShowHDRImages,
  loadUIScale,
  saveColorScheme,
  saveNSFWVisibility,
  saveOrbitDisabled,
  saveShowHDRImages,
  saveSubmitMode,
  saveUIScale,
  systemColorSchemeSupported,
  uiScaleStorageKey,
} from '../../services/appearance';
import {
  setHDRImages,
  setSystemColorScheme,
  setUIScale,
  setUserColorScheme,
} from '../action-creators';
import {
  SET_HDR_IMAGES,
  SET_NSFW_VISIBILITY,
  SET_ORBIT,
  SET_SUBMIT_MODE,
  SET_UI_SCALE,
  SET_USER_COLOR_SCHEME,
} from '../action-types';

export const appearanceMiddleware = (store) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === colorSchemeStorageKey) {
        store.dispatch(setUserColorScheme(loadColorScheme()));
      }
      if (e.key === uiScaleStorageKey) {
        store.dispatch(setUIScale(loadUIScale()));
      }
      if (e.key === hdrImagesStorageKey) {
        store.dispatch(setHDRImages(loadShowHDRImages()));
      }
    });

    if (systemColorSchemeSupported) {
      for (const scheme of [SCHEME_LIGHT, SCHEME_DARK, SCHEME_NO_PREFERENCE]) {
        const mq = window.matchMedia(`(prefers-color-scheme: ${scheme})`);
        const handler = (mq) => mq.matches && store.dispatch(setSystemColorScheme(scheme));
        mq.addListener(handler);
      }
    }
  }

  return (next) => (action) => {
    next(action);
    if (action.type === SET_USER_COLOR_SCHEME) {
      saveColorScheme(action.payload);
      return;
    }
    if (action.type === SET_NSFW_VISIBILITY) {
      saveNSFWVisibility(action.payload);
      return;
    }
    if (action.type === SET_ORBIT) {
      saveOrbitDisabled(action.payload);
      return;
    }
    if (action.type === SET_UI_SCALE) {
      saveUIScale(action.payload);
      return;
    }
    if (action.type === SET_SUBMIT_MODE) {
      saveSubmitMode(action.payload);
      return;
    }
    if (action.type === SET_HDR_IMAGES) {
      saveShowHDRImages(action.payload);
      return;
    }
  };
};
