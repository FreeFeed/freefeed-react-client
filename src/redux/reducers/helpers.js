import { LOCATION_CHANGE } from 'react-router-redux';

export function patchObjectByKey(object, key, patcher) {
  return key in object ? { ...object, [key]: patcher(object[key]) } : object;
}

export function setOnLocationChange(targetState, excludePathnames = []) {
  return (state, action) => {
    if (action.type === LOCATION_CHANGE && !excludePathnames.includes(action.payload.pathname)) {
      return targetState;
    }
    return state;
  };
}
