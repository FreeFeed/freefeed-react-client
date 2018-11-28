import { describe, it } from 'mocha';
import expect from 'unexpected';

import { sendTo } from '../../../../src/redux/reducers';
import { WHO_AM_I, SUBSCRIBE, UNSUBSCRIBE } from '../../../../src/redux/action-types';
import { response } from '../../../../src/redux/action-helpers';


const stateInitial = {
  expanded: false,
  feeds:    []
};

const payloadOneSub = {
  "users":       { "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "username": "clbn12", "type": "user", "screenName": "clbn12", "email": "clbn12@clbn12.com", "isPrivate": "0", "frontendPreferences": {}, "profilePictureLargeUrl": "", "profilePictureMediumUrl": "", "banIds": [], "statistics": { "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "posts": "0", "likes": "0", "comments": "0", "subscribers": "0", "subscriptions": "1" }, "administrators": ["86ad24d8-0ca0-42af-905f-743d3a472eb6"], "pendingGroupRequests": false, "subscriptions": ["7f2b907a-edc3-4011-bbe8-8979408decef", "540a5c2b-10d8-4662-8194-7655592653da", "008d3f1e-f1b5-4395-8b31-30f2d842b3dc"] },
  "admins":      [{ "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "username": "clbn12", "type": "user", "screenName": "clbn12", "updatedAt": "1456840434186", "isPrivate": "0", "profilePictureLargeUrl": "", "profilePictureMediumUrl": "", "administrators": [{}], "statistics": { "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "posts": "0", "likes": "0", "comments": "0", "subscribers": "0", "subscriptions": "1" } }],
  "subscribers": [
    { "id": "d49b39eb-b8f1-4e2e-90fc-7be68c6db34f", "username": "apples", "screenName": "Яблоки", "type": "group", "updatedAt": "1455311800566", "createdAt": "1454238830127", "isPrivate": "0", "isRestricted": "0", "profilePictureLargeUrl": "", "profilePictureMediumUrl": "" }
  ],
  "subscriptions": [
    { "id": "7f2b907a-edc3-4011-bbe8-8979408decef", "name": "Likes", "user": "d49b39eb-b8f1-4e2e-90fc-7be68c6db34f" },
    { "id": "540a5c2b-10d8-4662-8194-7655592653da", "name": "Comments", "user": "d49b39eb-b8f1-4e2e-90fc-7be68c6db34f" },
    { "id": "008d3f1e-f1b5-4395-8b31-30f2d842b3dc", "name": "Posts", "user": "d49b39eb-b8f1-4e2e-90fc-7be68c6db34f" }
  ]
};

const stateOneSub = {
  expanded: false,
  feeds:    [
    {
      id:   "008d3f1e-f1b5-4395-8b31-30f2d842b3dc",
      user: {
        id:                      "d49b39eb-b8f1-4e2e-90fc-7be68c6db34f",
        username:                "apples",
        screenName:              "Яблоки",
        type:                    "group",
        updatedAt:               "1455311800566",
        createdAt:               "1454238830127",
        isPrivate:               "0",
        isRestricted:            "0",
        profilePictureLargeUrl:  "",
        profilePictureMediumUrl: ""
      }
    }
  ]
};

const payloadTwoSubs = {
  "users":       { "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "username": "clbn12", "type": "user", "screenName": "clbn12", "email": "clbn12@clbn12.com", "isPrivate": "0", "frontendPreferences": {}, "profilePictureLargeUrl": "", "profilePictureMediumUrl": "", "banIds": [], "statistics": { "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "posts": "0", "likes": "0", "comments": "0", "subscribers": "0", "subscriptions": "2" }, "administrators": ["86ad24d8-0ca0-42af-905f-743d3a472eb6"], "pendingGroupRequests": false, "subscriptions": ["60265209-1439-4a54-8491-00749a94a195", "5d5fb359-1f8f-4e95-a16d-c5ae9b51dd47", "1d0f5fb9-71f3-45ee-bec2-356e496612ca", "7f2b907a-edc3-4011-bbe8-8979408decef", "540a5c2b-10d8-4662-8194-7655592653da", "008d3f1e-f1b5-4395-8b31-30f2d842b3dc"] },
  "admins":      [{ "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "username": "clbn12", "type": "user", "screenName": "clbn12", "updatedAt": "1456840434186", "isPrivate": "0", "profilePictureLargeUrl": "", "profilePictureMediumUrl": "", "administrators": [{}], "statistics": { "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "posts": "0", "likes": "0", "comments": "0", "subscribers": "0", "subscriptions": "2" } }],
  "subscribers": [
    { "id": "66d2c0e2-ce15-4c73-bbc7-3205e7f2e259", "username": "pears", "screenName": "Груши", "type": "group", "updatedAt": "1456757417266", "createdAt": "1453995078415", "isPrivate": "0", "isRestricted": "0", "profilePictureLargeUrl": "https://frf-api.applied.creagenics.com/profilepics/7be65d5e-ed97-4d8e-9298-385f974891e6_75.jpg", "profilePictureMediumUrl": "https://frf-api.applied.creagenics.com/profilepics/7be65d5e-ed97-4d8e-9298-385f974891e6_50.jpg" },
    { "id": "d49b39eb-b8f1-4e2e-90fc-7be68c6db34f", "username": "apples", "screenName": "Яблоки", "type": "group", "updatedAt": "1455311800566", "createdAt": "1454238830127", "isPrivate": "0", "isRestricted": "0", "profilePictureLargeUrl": "", "profilePictureMediumUrl": "" }
  ],
  "subscriptions": [
    { "id": "60265209-1439-4a54-8491-00749a94a195", "name": "Comments", "user": "66d2c0e2-ce15-4c73-bbc7-3205e7f2e259" },
    { "id": "5d5fb359-1f8f-4e95-a16d-c5ae9b51dd47", "name": "Posts", "user": "66d2c0e2-ce15-4c73-bbc7-3205e7f2e259" },
    { "id": "1d0f5fb9-71f3-45ee-bec2-356e496612ca", "name": "Likes", "user": "66d2c0e2-ce15-4c73-bbc7-3205e7f2e259" },
    { "id": "7f2b907a-edc3-4011-bbe8-8979408decef", "name": "Likes", "user": "d49b39eb-b8f1-4e2e-90fc-7be68c6db34f" },
    { "id": "540a5c2b-10d8-4662-8194-7655592653da", "name": "Comments", "user": "d49b39eb-b8f1-4e2e-90fc-7be68c6db34f" },
    { "id": "008d3f1e-f1b5-4395-8b31-30f2d842b3dc", "name": "Posts", "user": "d49b39eb-b8f1-4e2e-90fc-7be68c6db34f" }
  ]
};

const stateTwoSubs = {
  expanded: false,
  feeds:    [
    {
      id:   "5d5fb359-1f8f-4e95-a16d-c5ae9b51dd47",
      user: {
        id:                      "66d2c0e2-ce15-4c73-bbc7-3205e7f2e259",
        username:                "pears",
        screenName:              "Груши",
        type:                    "group",
        updatedAt:               "1456757417266",
        createdAt:               "1453995078415",
        isPrivate:               "0",
        isRestricted:            "0",
        profilePictureLargeUrl:  "https://frf-api.applied.creagenics.com/profilepics/7be65d5e-ed97-4d8e-9298-385f974891e6_75.jpg",
        profilePictureMediumUrl: "https://frf-api.applied.creagenics.com/profilepics/7be65d5e-ed97-4d8e-9298-385f974891e6_50.jpg"
      }
    },
    {
      id:   "008d3f1e-f1b5-4395-8b31-30f2d842b3dc",
      user: {
        id:                      "d49b39eb-b8f1-4e2e-90fc-7be68c6db34f",
        username:                "apples",
        screenName:              "Яблоки",
        type:                    "group",
        updatedAt:               "1455311800566",
        createdAt:               "1454238830127",
        isPrivate:               "0",
        isRestricted:            "0",
        profilePictureLargeUrl:  "",
        profilePictureMediumUrl: ""
      }
    }
  ]
};

const payloadZeroSubs = {
  "users":  { "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "username": "clbn12", "type": "user", "screenName": "clbn12", "email": "clbn12@clbn12.com", "isPrivate": "0", "frontendPreferences": {}, "profilePictureLargeUrl": "", "profilePictureMediumUrl": "", "banIds": [], "statistics": { "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "posts": "0", "likes": "0", "comments": "0", "subscribers": "0", "subscriptions": "0" }, "administrators": ["86ad24d8-0ca0-42af-905f-743d3a472eb6"], "pendingGroupRequests": false },
  "admins": [{ "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "username": "clbn12", "type": "user", "screenName": "clbn12", "updatedAt": "1456840434186", "isPrivate": "0", "profilePictureLargeUrl": "", "profilePictureMediumUrl": "", "administrators": [{}], "statistics": { "id": "86ad24d8-0ca0-42af-905f-743d3a472eb6", "posts": "0", "likes": "0", "comments": "0", "subscribers": "0", "subscriptions": "0" } }]
};


describe('sendTo()', () => {
  it('should add one existing recipient into the initially empty state after getting WHO_AM_I', () => {
    const state = sendTo(stateInitial, { type: response(WHO_AM_I), payload: payloadOneSub });
    expect(state, 'to equal', stateOneSub);
  });

  it('should add a new recipient, increasing their number to two after getting SUBSCRIBE', () => {
    const state = sendTo(stateOneSub, { type: response(SUBSCRIBE), payload: payloadTwoSubs });
    expect(state, 'to equal', stateTwoSubs);
  });

  it('should remove one of the two recipients, decreasing their number to one after getting UNSUBSCRIBE', () => {
    const state = sendTo(stateTwoSubs, { type: response(UNSUBSCRIBE), payload: payloadOneSub });
    expect(state, 'to equal', stateOneSub);
  });

  it('should remove the only recipient, decreasing their number to zero after getting UNSUBSCRIBE', () => {
    const state = sendTo(stateOneSub, { type: response(UNSUBSCRIBE), payload: payloadZeroSubs });
    expect(state, 'to equal', stateInitial);
  });
});
