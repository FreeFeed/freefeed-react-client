import React from 'react';
import { shallow } from 'enzyme';

import PostComments from '../../src/components/post-comments';

const generateArray = (n) => [...Array(n).keys()].map((i) => ({ id: i }));
const commentArrays = generateArray(5).map((_, index) => generateArray(index));

const renderPostComments = (props = {}) => {
  const defaultProps = {};

  return shallow(<PostComments {...defaultProps} {...props} />);
};

const defaultPost = { isCommenting: false, createdBy: { username: '' }, user: {} };

describe('<PostComments>', () => {
  it('Should render first comment if there are any comments', () => {
    const post = { ...defaultPost, omittedComments: 1 };

    const actual = renderPostComments({ comments: [], post });
    expect(actual).toMatchSnapshot();

    const actualWithOneComment = renderPostComments({ comments: [{}], post });
    expect(actualWithOneComment).toMatchSnapshot();
  });

  it('Should render right number of comments', () => {
    const post = { ...defaultPost, omittedComments: 0 };

    const actual = renderPostComments({ comments: [], post });
    expect(actual).toMatchSnapshot();

    const actualWithOneComment = renderPostComments({ comments: [{}], post });
    expect(actualWithOneComment).toMatchSnapshot();

    const actualWithFourComments = renderPostComments({
      comments: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }, { id: 'c4' }],
      post,
    });
    const comments = actualWithFourComments.find('PostComment');
    expect(comments.length).toEqual(4);
  });

  it('Should render omitted number properly', () => {
    const post = { ...defaultPost, omittedComments: 2 };
    const actual = renderPostComments({ comments: [{}, {}], post });
    const moreCommentsWrapper = actual.find('MoreCommentsWrapper');
    expect(moreCommentsWrapper.props().omittedComments).toEqual(2);
  });

  it('Should not render omitted number when there are no omitted comments', () => {
    const post = { ...defaultPost, omittedComments: 0 };

    commentArrays.forEach((comments) => {
      const actual = renderPostComments({ comments, post });
      const moreCommentsWrapper = actual.find('MoreCommentsWrapper');
      expect(moreCommentsWrapper.length).toEqual(0);
    });
  });

  it('Should render last comment if there is more than one comment', () => {
    const post = { ...defaultPost, omittedComments: 1 };

    // not enough comments to show anything after "more"
    commentArrays.slice(0, 2).forEach((comments) => {
      const actual = renderPostComments({ comments, post });
      const postCommentAfterMoreCommentsWrapper = actual.find('MoreCommentsWrapper + PostComment');
      expect(postCommentAfterMoreCommentsWrapper.length).toEqual(0);
    });

    // enough comments to show something after "more"
    commentArrays.slice(2).forEach((comments) => {
      const actual = renderPostComments({ comments, post });
      const postCommentAfterMoreCommentsWrapper = actual.find('MoreCommentsWrapper + PostComment');
      expect(postCommentAfterMoreCommentsWrapper.length).toEqual(1);
    });
  });

  it('Should render commenting section only if post is commented', () => {
    const post = { ...defaultPost, omittedComments: 1 };
    const user = { id: '12345' };

    const actual = renderPostComments({ comments: [], post, user });
    expect(actual.find('PostComment').length).toEqual(0);

    const postIsCommenting = { ...defaultPost, omittedComments: 1, isCommenting: true };
    const actualIsCommenting = renderPostComments({ comments: [], post: postIsCommenting, user });
    expect(actualIsCommenting.find('PostComment').length).toEqual(1);
  });

  it('Should render "Sign In" link if post is commented and user is anonymous', () => {
    const post = { ...defaultPost, omittedComments: 1 };
    const user = {};

    const actual = renderPostComments({ comments: [], post, user });
    expect(actual.find('PostComment').length).toEqual(0);
    expect(actual.find('Link[to="/signin"]').length).toEqual(0);

    const postIsCommenting = { ...defaultPost, omittedComments: 1, isCommenting: true };
    const actualIsCommenting = renderPostComments({ comments: [], post: postIsCommenting, user });
    expect(actualIsCommenting.find('Link[to="/signin"]').length).toEqual(1);
  });
});
