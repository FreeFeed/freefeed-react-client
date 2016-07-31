import {frontendPreferences as frontendPrefsConfig} from '../config';
import _ from 'lodash';

export function getCookie(name) {
  const begin = document.cookie.indexOf(name);
  if (begin === -1) {
    return '';
  }
  const fromBegin = document.cookie.substr(begin);
  const tokenWithName = fromBegin.split(';');
  const tokenWithNameSplit = tokenWithName[0].split('=');
  const token = tokenWithNameSplit[1];
  return token.trim();
}

export function setCookie(name, value = '', expireDays, path) {
  const expiresDate = Date.now() + expireDays * 24 * 60 * 60 * 1000;
  const expiresTime = new Date(expiresDate).toUTCString();
  //http://stackoverflow.com/questions/1134290/cookies-on-localhost-with-explicit-domain
  const cookie = `${name}=${value}; expires=${expiresTime}; path=${path}`;
  return document.cookie = cookie;
}

import moment from 'moment';

export function fromNowOrNow(date) {
  var now = moment(date);

  if (Math.abs(moment().diff(now)) < 1000) { // 1000 milliseconds
    return 'just now';
  }

  return now.fromNow();
}

export function getFullDate(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss [UTC]Z');
}

import defaultUserpic50Path from 'assets/images/default-userpic-50.png';
import defaultUserpic75Path from 'assets/images/default-userpic-75.png';

const userDefaults = {
  profilePictureMediumUrl: defaultUserpic50Path,
  profilePictureLargeUrl: defaultUserpic75Path,
  frontendPreferences: frontendPrefsConfig.defaultValues
};

export function userParser(user) {
  const newUser = {...user};

  // Profile pictures
  newUser.profilePictureMediumUrl = user.profilePictureMediumUrl || userDefaults.profilePictureMediumUrl;
  newUser.profilePictureLargeUrl = user.profilePictureLargeUrl || userDefaults.profilePictureLargeUrl;

  // Frontend preferences (only use this client's subtree)
  const prefSubTree = user.frontendPreferences && user.frontendPreferences[frontendPrefsConfig.clientId];
  newUser.frontendPreferences = _.merge({}, userDefaults.frontendPreferences, prefSubTree);

  return newUser;
}

export function postParser(post) {
  post.commentsDisabled = (post.commentsDisabled === '1');
  return {...post};
}

export function preventDefault(realFunction) {
  return (event) => {
    event.preventDefault();
    return realFunction && realFunction();
  };
}

export function confirmFirst(realFunction) {
  return () => {
    if (confirm('Are you sure?')) {
      return realFunction && realFunction();
    }
  };
}

export function getCurrentRouteName(router) {
  return router && router.routes && router.routes[router.routes.length - 1].name;
}

export function pluralForm(n, singular, plural = null, format = 'n w') {
  let w;

  if (n == 1) {
    w = singular;
  } else if (plural) {
    w = plural;
  } else {
    w = singular + 's';
  }

  return format.replace('n', n).replace('w', w);
}

import URLFinder from 'ff-url-finder';
import config from '../config';

export const finder = new URLFinder(
  ['ru', 'com', 'net', 'org', 'info', 'gov', 'edu', 'рф', 'ua'],
  config.siteDomains,
);

finder.withHashTags = true;
finder.withArrows = true;

import {LINK, isLink} from '../utils/link-types';

const endsWithExclamation = str => str && str[str.length - 1] === '!';

const previousElementCheck = (index, array) => {
  const previousElement = array[index - 1];
  if (!previousElement) {
    return true;
  }
  if (isLink(previousElement)) {
    return true;
  }
  return !endsWithExclamation(previousElement.text);
};

export function getFirstLinkToEmbed(text) {
  return finder
    .parse(text)
    .filter(({type, text}, index, links) => {
      return (type ===  LINK
              && /^https?:\/\//i.test(text)
              && previousElementCheck(index, links));
    })
    .map(it => it.text)[0];
};

