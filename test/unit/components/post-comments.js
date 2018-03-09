import { describe, it } from 'mocha';
import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';

import React from 'react';
import flatten from 'lodash/flatten';

import PostComments from '../../../src/components/post-comments';
import PostComment from '../../../src/components/post-comment';
import MoreCommentsWrapper from '../../../src/components/more-comments-wrapper';

const expect = unexpected.clone()
  .use(unexpectedReact);

const generateArray = (n) => [...Array(n).keys()].map(() => ({}));
const commentArrays = generateArray(5).map((_, index) => generateArray(index));

// const renderComments = (comments, omittedComments = 0, isCommenting = false, currentUser = {}) => {
//   const post = { omittedComments, isCommenting, createdBy: { username:'' }, user: currentUser };
//
//   const renderer = createShallowRenderer();
//   renderer.render(<PostComments {...{ comments, post }} />);
//   return renderer.getRenderOutput().props.children;
// };
//
// const renderedCommentsAndOmitted = commentArrays.map((comments) => renderComments(comments, 1));
// const renderedCommentsWithoutOmitted = commentArrays.map((comments) => renderComments(comments, 0));
//
// const firstCommentRendered = (renderedComments) => renderedComments[0];
// const middleCommentsRendered = (renderedComments) => renderedComments[1];
// const omittedCommentsRendered = (renderedComments) => renderedComments[1];
// const lastCommentRendered = (renderedComments) => renderedComments[2];
// const isCommenting = (renderedComments) => renderedComments[3];

describe('<PostComments>', () => {
  it(`should render first comment if there're any comments`, () => {
    const post = { omittedComments: 1, isCommenting: false, createdBy: { username:'' }, user: {} };

    expect(
      <PostComments comments={[]} post={post} />,
      'when rendered',
      'to have rendered with all children',
      <div>
        <MoreCommentsWrapper />
      </div>
    );

    expect(
      <PostComments comments={[{}]} post={post} />,
      'when rendered',
      'to have rendered with all children',
      <div>
        <PostComment />
        <MoreCommentsWrapper />
      </div>
    );
  });

  it('should render right number of comments', async () => {
    const post = { omittedComments: 0, isCommenting: false, createdBy: { username:'' }, user: {} };

    expect(
      <PostComments comments={[]} post={post} />,
      'when rendered',
      'to have rendered with all children',
      <div />
    );

    expect(
      <PostComments comments={[{}]} post={post} />,
      'when rendered',
      'to have rendered with all children',
      <div>
        <PostComment />
      </div>
    );

    const root = await expect(
      <PostComments comments={[{}, {}, {}, {}]} post={post} />,
      'when rendered',
      'queried for',
      <div className="comments" />
    );
    const comments = flatten(root.props.children).filter((tag) => tag.type === PostComment);
    expect(comments, 'to have length', 4);
  });

  it('should render omitted number properly', () => {
    const post = { omittedComments: 2, isCommenting: false, createdBy: { username:'' }, user: {} };

    expect(
      <PostComments comments={[{}, {}]} post={post} />,
      'when rendered',
      'to contain',
      <MoreCommentsWrapper omittedComments={2} />
    );
  });

  it(`should not render omitted number when there're no omitted comments`, () => {
    commentArrays.map((comments) => {
      const post = { omittedComments: 0, isCommenting: false, createdBy: { username:'' }, user: {} };
      expect(
        <PostComments comments={comments} post={post} />,
        'when rendered',
        'not to contain',
        <MoreCommentsWrapper />
      );
    });
  });

  it(`should render last comment if there's more than one comment`, () => {
    // not enough comments to show anything after "more"
    commentArrays.slice(0, 2).map((comments) => {
      const post = { omittedComments: 1, isCommenting: false, createdBy: { username: '' }, user: {} };
      expect(
        <PostComments comments={comments} post={post} />,
        'when rendered',
        'not to contain',
        <div>
          <PostComment />
          <MoreCommentsWrapper />
          <PostComment />
        </div>
      );
    });

    // enough comments to show something after "more"
    commentArrays.slice(2).map((comments) => {
      const post = { omittedComments: 1, isCommenting: false, createdBy: { username: '' }, user: {} };
      expect(
        <PostComments comments={comments} post={post} />,
        'when rendered',
        'to contain',
        <div>
          <PostComment />
          <MoreCommentsWrapper />
          <PostComment />
        </div>
      );
    });
  });

  it('should render commenting section only if post is commented', () => {
    const post = { omittedComments: 1, isCommenting: false, createdBy: { username:'' }, user: {} };
    expect(
      <PostComments comments={[]} post={post} />,
      'when rendered',
      'not to contain',
      <PostComment isEditing={true} />
    );

    post.isCommenting = true;
    expect(
      <PostComments comments={[]} post={post} />,
      'when rendered',
      'to contain',
      <PostComment isEditing={true} />
    );
  });
});
