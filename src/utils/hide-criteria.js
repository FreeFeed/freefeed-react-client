import { differenceWith, intersectionWith } from 'lodash';
import { normalizeHashtag } from './norm-hashtags';

// A post in the home feed can be hidden by criteria of several types

export const USERNAME = 'USERNAME';
export const HASHTAG = 'HASHTAG';

/**
 * @typedef {typeof USERNAME | typeof HASHTAG} CriterionType
 * @typedef {{type: CriterionType, value: string}} Criterion
 */

/**
 *
 * @param {Criterion} f1
 * @param {Criterion} f2
 * @returns {boolean}
 */
export function isEqual(f1, f2) {
  if (f1.type === USERNAME && f2.type === USERNAME) {
    return f1.value === f2.value;
  }
  if (f1.type === HASHTAG && f2.type === HASHTAG) {
    return normalizeHashtag(f1.value) === normalizeHashtag(f2.value);
  }
  return false;
}

/**
 * @param {{hideUsers: string[], hideTags: string[]}} prefs
 * @returns {Criterion[]}
 */
export function prefsToCriteria(prefs) {
  return [
    ...prefs.hideUsers.map((u) => ({ type: USERNAME, value: u })),
    ...prefs.hideTags.map((t) => ({ type: HASHTAG, value: t })),
  ];
}

/**
 * @param {Criterion[]} criteria
 * @returns {{hideUsers: string[], hideTags: string[]}}
 */
export function criteriaToPrefs(criteria) {
  const result = {
    hideUsers: [],
    hideTags: [],
  };
  for (const { type, value } of criteria) {
    type === USERNAME && result.hideUsers.push(value);
    type === HASHTAG && result.hideTags.push(value);
  }
  return result;
}

/**
 *
 * @param {Criterion[]} criteria
 * @param {Criterion|Criterion[]} toExclude
 * @returns {Criterion[]}
 */
export function removeCriteria(criteria, toExclude) {
  if (!Array.isArray(toExclude)) {
    toExclude = [toExclude];
  }
  return differenceWith(criteria, toExclude, isEqual);
}

/**
 * @param {Criterion[]} criteria
 * @param {Criterion} needle
 * @returns {boolean}
 */
export function hasCriterion(criteria, needle) {
  return criteria.some((f) => isEqual(f, needle));
}

/**
 * Add newCriterion if there is no existing that equal
 *
 * @param {Criterion[]} criteria
 * @param {Criterion} newCriterion
 * @returns {Criterion[]}
 */
export function addCriterion(criteria, newCriterion) {
  if (hasCriterion(criteria, newCriterion)) {
    return criteria;
  }
  return [...criteria, newCriterion];
}

/**
 * @param {Criterion[]} criteria1
 * @param {Criterion[]} criteria2
 * @returns {Criterion[]}
 */
export function commonCriteria(criteria1, criteria2) {
  return intersectionWith(criteria1, criteria2, isEqual);
}
