/* global describe, it, expect, jest */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { createStore } from 'redux';
import * as reactRedux from 'react-redux';

import PostComments from '../../src/components/post/post-comments';

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
  },
};

const COMMENT1 = {
  id: 'comment1',
  body: 'Comment 1 body',
  omitBubble: true,
  user: AUTHOR,
  createdAt: '1617727500000',
  seqNumber: 1,
};

const COMMENT2 = {
  id: 'comment2',
  body: '@author comment 2\nMultilinebody',
  omitBubble: true,
  user: { id: 'other-user', username: 'other' },
  createdAt: '1617727600000',
  seqNumber: 2,
};

const COMMENT3 = {
  id: 'comment3',
  body: '^ response to comment 2',
  omitBubble: true,
  user: AUTHOR,
  createdAt: '1617727700000',
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
};

const defaultState = {
  user: VIEWER,
  commentEditState: {},
  comments: {
    [COMMENT1.id]: COMMENT1,
    [COMMENT2.id]: COMMENT2,
    [COMMENT3.id]: COMMENT3,
  },
};

const renderPostComments = (props = {}, options = {}) => {
  const { Provider } = reactRedux;
  const dummyReducer = (state) => state;
  const store = createStore(dummyReducer, defaultState);

  const defaultProps = {
    post: POST,
    comments: [COMMENT1, COMMENT2, COMMENT3],
    entryUrl: 'https://',
    isSinglePost: true,
    isLoadingComments: false,
    addComment: () => {},
    toggleCommenting: () => {},
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

  it('Renders omitted comments and expands them', () => {
    const showMoreComments = jest.fn();
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
    userEvent.click(screen.getByText('12 more comments with 34 likes', { role: 'button' }));
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

  it('Renders add comment link which toggles comment form', () => {
    const toggleCommenting = jest.fn();
    renderPostComments({
      user: VIEWER,
      post: {
        ...POST,
        isSinglePost: false,
        isCommenting: false,
      },
      toggleCommenting,
    });
    userEvent.click(screen.getByText('Add comment', { role: 'button' }));
    expect(toggleCommenting).toHaveBeenCalledWith('post-id');
  });

  it('Highlights a comment when arrow is hovered', () => {
    renderPostComments();
    expect(document.querySelectorAll('.highlighted').length).toBe(0);
    userEvent.hover(screen.getByText('^'));
    expect(document.querySelectorAll('.highlighted').length).toBe(1);
    expect(document.querySelector('.highlighted').getAttribute('data-author')).toBe('other');
  });
});
