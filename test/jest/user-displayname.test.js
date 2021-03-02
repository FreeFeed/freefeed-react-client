/* global describe, it, expect */
import { render } from '@testing-library/react';

import { UserDisplayName } from '../../src/components/user-displayname';
import {
  DISPLAYNAMES_BOTH,
  DISPLAYNAMES_DISPLAYNAME,
} from '../../src/utils/frontend-preferences-options';

describe('UserDisplayName', () => {
  it("It's-a me!", () => {
    const { asFragment } = render(<UserDisplayName username="mario" myUsername="mario" />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows only username', () => {
    const { asFragment } = render(<UserDisplayName username="mario" screenName="mario" />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows both username and screenname', () => {
    const { asFragment } = render(
      <UserDisplayName
        username="mario"
        screenName="The Plumber"
        prefs={{ displayOption: DISPLAYNAMES_BOTH }}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows only screenname', () => {
    const { asFragment } = render(
      <UserDisplayName
        username="mario"
        screenName="The Plumber"
        prefs={{ displayOption: DISPLAYNAMES_DISPLAYNAME }}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
