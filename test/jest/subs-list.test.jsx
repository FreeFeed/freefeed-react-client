/* global describe, it, expect */
import { render } from '@testing-library/react';

import SubsList from '../../src/components/subs-list';
import { StateProvider } from './state-provider';

const defaultState = {
  user: {
    frontendPreferences: {},
  },
};

describe('SubsList', () => {
  it('Renders a list of subscribers', () => {
    const { asFragment } = render(
      <StateProvider state={defaultState}>
        <SubsList
          title="Subscribers"
          listSections={[
            {
              title: 'Section',
              users: [
                {
                  id: 'u1',
                  screenName: 'User 1',
                  username: 'user1',
                  isMutual: true,
                  profilePictureUrl: 'pic1.jpg',
                },
                {
                  id: 'u2',
                  screenName: 'User 2',
                  username: 'user2',
                  isMutual: false,
                  profilePictureUrl: 'pic2.jpg',
                },
              ],
            },
          ]}
          showSectionsTitles
        />
      </StateProvider>,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
