/* global describe, it, expect, vi */
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { createStore } from 'redux';
import * as reactRedux from 'react-redux';

import PostComments from '../../src/components/post/post-comments';
import { initialAsyncState } from '../../src/redux/async-helpers';

// mock icon component to make snapshots smaller
vi.mock('../../src/components/fontawesome-icons', () => ({
  Icon: ({ icon }) => `fontawesome-icon ${icon.iconName}`,
}));

// mock it out because I don't want to deal with it
vi.mock('../../src/components/prevent-page-leaving', () => ({
  PreventPageLeaving: () => '',
}));

const AUTHOR = {
  id: 'user-id',
  username: 'author',
};

const VIEWER = {
  ...AUTHOR,
  frontendPreferences: {
    timeDisplay: {},
    comments: {
      highlightComments: true,
    },
    timeDifferenceForSpacer: 1000 * 60 * 60 * 24 * 6,
  },
};

const COMMENT1 = {
  id: 'comment1',
  body: 'Comment 1 body',
  omitBubble: true,
  user: AUTHOR,
  createdAt: '1617720000000', // Tue Apr 06 2021 14:40:00 GMT+0000
  seqNumber: 1,
};

const COMMENT2 = {
  id: 'comment2',
  body: '@author comment 2\nMultilinebody',
  omitBubble: true,
  user: { id: 'other-user', username: 'other' },
  createdAt: '1617780000000', // Wed Apr 07 2021 07:20:00 GMT+0000
  seqNumber: 2,
};

const COMMENT3 = {
  id: 'comment3',
  body: '^ response to comment 2',
  omitBubble: true,
  user: AUTHOR,
  createdAt: '1630000000000', // Thu Aug 26 2021 17:46:40 GMT+0000
  seqNumber: 3,
};

const POST = {
  id: 'post-id',
  omittedComments: 0,
  omittedCommentsOffset: 0,
  omittedCommentLikes: 0,
  isCommenting: true,
  isSinglePost: true,
  user: AUTHOR,
  createdAt: '1500000000000', // Fri Jul 14 2017 02:40:00 GMT+0000
};

const defaultState = {
  user: VIEWER,
  commentEditState: {},
  comments: {
    [COMMENT1.id]: COMMENT1,
    [COMMENT2.id]: COMMENT2,
    [COMMENT3.id]: COMMENT3,
  },
  serverInfoStatus: initialAsyncState,
  translationStates: {},
  translationResults: {},
};

const renderPostComments = (props = {}, options = {}) => {
  const { Provider } = reactRedux;
  const dummyReducer = (state) => state;
  const store = createStore(dummyReducer, defaultState);

  const defaultProps = {
    user: VIEWER,
    post: POST,
    comments: [COMMENT1, COMMENT2, COMMENT3],
    entryUrl: 'https://',
    isSinglePost: true,
    isLoadingComments: false,
    addComment: () => {},
    toggleCommenting: () => {},
    nowDate: new Date('2022-01-01'),
  };

  const rendered = render(
    <Provider store={store}>
      <PostComments {...defaultProps} {...props} />
    </Provider>,
    options,
  );

  return {
    ...rendered,
    rerender: (props = {}, options = {}) =>
      renderPostComments(props, { container: rendered.container, ...options }),
  };
};

describe('PostComments', () => {
  it("Renders post comments and doesn't blow up", () => {
    const { asFragment } = renderPostComments();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders omitted comments and expands them', async () => {
    const showMoreComments = vi.fn();
    const { rerender } = renderPostComments({
      post: {
        ...POST,
        omittedComments: 12,
        omittedCommentLikes: 34,
        omittedCommentsOffset: 1,
      },
      showMoreComments,
    });
    expect(screen.getByLabelText(/15 comments/)).toBeInTheDocument();
    await userEvent.click(screen.getByText('12 more comments with 34 likes', { role: 'button' }));
    expect(showMoreComments).toHaveBeenCalledWith('post-id');

    expect(screen.queryByLabelText('Loading comments...')).not.toBeInTheDocument();
    rerender({
      post: {
        ...POST,
        omittedComments: 12,
        omittedCommentLikes: 34,
        omittedCommentsOffset: 1,
        isLoadingComments: true,
      },
      showMoreComments,
    });
    expect(screen.queryByLabelText('Loading comments...')).toBeInTheDocument();
  });

  it('Renders add comment link which toggles comment form', async () => {
    const toggleCommenting = vi.fn();
    renderPostComments({
      user: VIEWER,
      post: {
        ...POST,
        isSinglePost: false,
        isCommenting: false,
      },
      toggleCommenting,
    });
    await userEvent.click(screen.getByText('Add comment', { role: 'button' }));
    expect(toggleCommenting).toHaveBeenCalledWith('post-id');
  });

  it('Highlights a comment when arrow is hovered', async () => {
    renderPostComments();
    expect(document.querySelectorAll('.highlighted').length).toBe(0);
    await userEvent.hover(screen.getByText('^'));
    expect(document.querySelectorAll('.highlighted').length).toBe(1);
    expect(document.querySelector('.highlighted').getAttribute('data-author')).toBe('other');
  });
});
