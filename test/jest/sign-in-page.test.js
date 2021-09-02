/* global describe, it, expect, jest, beforeEach */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as reactRedux from 'react-redux';

import SignInPage from '../../src/components/settings/sign-in';
import * as actionCreators from '../../src/redux/action-creators';

jest.mock('../../src/components/prevent-page-leaving', () => {
  return {
    PreventPageLeaving: () => null,
  };
});

const defaultState = {
  user: {
    id: 'user-id',
    username: 'user1',
    email: 'email@example.com',
  },
  extAuth: {
    providers: [],
    profiles: [],
    profilesStatus: {},
  },
  serverInfoStatus: {},
  settingsForms: {
    updatePasswordStatus: {},
  },
};

const renderSignInPage = (props = {}) => {
  const defaultProps = {};
  return render(<SignInPage {...defaultProps} {...props} />);
};

describe('SignInPage', () => {
  const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');

  beforeEach(() => {
    useSelectorMock.mockClear();
    useDispatchMock.mockClear();
    useSelectorMock.mockImplementation((selector) => selector(defaultState));
    useDispatchMock.mockImplementation(() => () => {});
  });

  it('Renders sign-in settings page', () => {
    const { asFragment } = renderSignInPage();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Updates user password', () => {
    const currentPassword = 'current';
    const newPassword = 'newpassword123';

    const updatePasswordMock = jest.spyOn(actionCreators, 'updatePassword');
    renderSignInPage();

    userEvent.type(screen.getByLabelText('Current password'), currentPassword);
    userEvent.type(screen.getByLabelText('New password'), newPassword);
    userEvent.type(screen.getByLabelText('Confirm password'), newPassword);
    userEvent.click(screen.getByText('Update password'));
    expect(updatePasswordMock).toHaveBeenCalledTimes(1);
    expect(updatePasswordMock).toHaveBeenCalledWith({
      currentPassword,
      password: newPassword,
      passwordConfirmation: newPassword,
    });
  });
});
