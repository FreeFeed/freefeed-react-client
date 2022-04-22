import { describe, it, before } from 'mocha';
import expect from 'unexpected';
import {
  GET_USER_INFO,
  MAKE_GROUP_ADMIN,
  UNADMIN_GROUP_ADMIN,
} from '../../../../src/redux/action-types';
import { response } from '../../../../src/redux/async-helpers';

import { groupAdmins } from '../../../../src/redux/reducers';
import { userParser } from '../../../../src/utils';

describe('Group admins', () => {
  let zeroState, filledState, fillAction;

  before(() => {
    zeroState = groupAdmins(undefined, { type: 'init' });
    fillAction = {
      type: response(GET_USER_INFO),
      payload: {
        users: { username: 'somegroup', type: 'group' },
        admins: [
          { id: 'id1', username: 'admin1' },
          { id: 'id2', username: 'admin2' },
        ],
      },
    };
    filledState = groupAdmins(zeroState, fillAction);
  });

  it('should fill admins on _group_ GET_USER_INFO response', () => {
    const newState = groupAdmins(zeroState, fillAction);
    expect(newState, 'to equal', { somegroup: fillAction.payload.admins.map(userParser) });
  });

  it('should not fill admins on _user_ GET_USER_INFO response', () => {
    const newState = groupAdmins(zeroState, {
      type: response(GET_USER_INFO),
      payload: {
        users: { username: 'someuser', type: 'user' },
        admins: [
          { id: 'id1', username: 'admin1' },
          { id: 'id2', username: 'admin2' },
        ],
      },
    });
    expect(newState, 'to be', zeroState);
  });

  it('should promote user to admin', () => {
    const newState = groupAdmins(filledState, {
      type: response(MAKE_GROUP_ADMIN),
      request: {
        groupName: 'somegroup',
        user: { id: 'id3', username: 'admin3' },
      },
    });
    expect(newState, 'to satisfy', {
      somegroup: [{ username: 'admin1' }, { username: 'admin2' }, { username: 'admin3' }],
    });
  });

  it('should not promote user to admin of untracked group', () => {
    const newState = groupAdmins(filledState, {
      type: response(MAKE_GROUP_ADMIN),
      request: {
        groupName: 'someothergroup',
        user: { id: 'id3', username: 'admin3' },
      },
    });
    expect(newState, 'to be', filledState);
  });

  it('should remove user from group admins', () => {
    const newState = groupAdmins(filledState, {
      type: response(UNADMIN_GROUP_ADMIN),
      request: {
        groupName: 'somegroup',
        user: { id: 'id2', username: 'admin2' },
      },
    });
    expect(newState, 'to satisfy', {
      somegroup: [{ username: 'admin1' }],
    });
  });

  it('should not remove user from admins of untracked group', () => {
    const newState = groupAdmins(filledState, {
      type: response(UNADMIN_GROUP_ADMIN),
      request: {
        groupName: 'someothergroup',
        user: { id: 'id2', username: 'admin2' },
      },
    });
    expect(newState, 'to be', filledState);
  });
});
