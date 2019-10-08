import { LOCATION_CHANGE } from 'react-router-redux';

export function patchObjectByKey(object, key, patcher) {
  return key in object ? { ...object, [key]: patcher(object[key]) } : object;
}

export function setOnLocationChange(targetState) {
  return (action, state) => {
    if (action.type === LOCATION_CHANGE) {
      return targetState;
    }
    return state;
  };
}
