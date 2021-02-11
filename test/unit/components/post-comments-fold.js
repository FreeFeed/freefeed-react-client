import { describe, it } from 'mocha';
import { createRenderer } from 'react-test-renderer/shallow';
import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';
import unexpectedSinon from 'unexpected-sinon';
import sinon from 'sinon';
import ErrorBoundary from '../../../src/components/error-boundary';
import PostComment from '../../../src/components/post-comment';
import PostComments, { minCommentsToFold } from '../../../src/components/post-comments';
import { CollapseComments } from '../../../src/components/post-comments/collapse-comments';
import ExpandComments from '../../../src/components/post-comments/expand-comments';

const expect = unexpected.clone().use(unexpectedReact).use(unexpectedSinon);

const commentsAfterFold = 2;
const minFoldedComments = 3;

describe('<PostComments>', () => {
  const defaultPostData = {
    id: 'postId',
    omittedComments: 0,
    omittedCommentsOffset: 0,
    isCommenting: false,
    createdBy: { username: '' },
    user: {},
  };

  describe('Post without omitted comments', () => {
    const post = { ...defaultPostData };

    it(`should render post without comments`, () => {
      const comments = genComments(0);
      expect(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have exactly rendered',
        <div className="comments" role="list" aria-label="0 comments">
          <ErrorBoundary />
        </div>,
      );
    });

    it(`should render post with one comment`, () => {
      const comments = genComments(1);
      expect(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have rendered with all children',
        <div className="comments" role="list">
          <PostComment />
        </div>,
      );
    });

    it(`should render post with two comments`, () => {
      const comments = genComments(2);
      expect(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have rendered with all children',
        <div className="comments" role="list">
          <PostComment />
          <PostComment />
        </div>,
      );
    });

    it(`should render post with three comments`, () => {
      const comments = genComments(3);
      expect(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have rendered with all children',
        <div className="comments" role="list">
          <PostComment />
          <PostComment />
          <PostComment />
        </div>,
      );
    });

    it(`should not fold comments if its count is below the limit`, () => {
      const nComments =
        1 + // first comment
        minFoldedComments + // folded comments
        commentsAfterFold + // comments after fold
        -1;
      const comments = genComments(nComments);

      expect(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have rendered with all children',
        <div className="comments" role="list">
          {genCommentElements(nComments)}
        </div>,
      );
    });

    it(`should fold comments if there are too many of them`, () => {
      const nComments =
        1 + // first comment
        minFoldedComments + // folded comments
        commentsAfterFold; // comments after fold
      const comments = genComments(nComments);
      comments[1].likes = 2;
      comments[2].likes = 3;

      expect(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have rendered with all children',
        <div className="comments" role="list">
          <PostComment />
          <ExpandComments omittedComments={minFoldedComments} omittedCommentLikes={5} />
          {genCommentElements(commentsAfterFold)}
        </div>,
      );
    });
  });

  describe('Post with omitted comments', () => {
    const post = {
      ...defaultPostData,
      omittedComments: 2,
      omittedCommentsOffset: 1,
    };

    it(`should render post with one comment after fold`, () => {
      expect(
        <PostComments
          comments={genComments(2)}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have rendered with all children',
        <div className="comments" role="list">
          <PostComment />
          <ExpandComments omittedComments={2} />
          <PostComment />
        </div>,
      );
    });

    it(`should render post with ${commentsAfterFold} comments after fold`, () => {
      const comments = genComments(commentsAfterFold + 1);

      expect(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have rendered with all children',
        <div
          className="comments"
          role="list"
          aria-label={`${comments.length + post.omittedComments} comments`}
        >
          <PostComment />
          <ExpandComments omittedComments={post.omittedComments} />
          {genCommentElements(commentsAfterFold)}
        </div>,
      );
    });

    it(`should render post with 3 comments after omitted`, () => {
      const comments = genComments(4);

      const p = { ...post, omittedCommentLikes: 5 };
      comments[1].likes = 2;

      expect(
        <PostComments comments={comments} post={p} commentsAfterFold={2} minFoldedComments={3} />,
        'when rendered',
        'to have rendered with all children',
        <div className="comments" role="list">
          <PostComment />
          <ExpandComments omittedComments={3} omittedCommentLikes={7} />
          {genCommentElements(2)}
        </div>,
      );
    });

    it(`should not show comment before omitted ones if it is not exist`, () => {
      const p = { ...post, omittedCommentsOffset: 0 };
      const comments = genComments(1);
      expect(
        <PostComments
          comments={comments}
          post={p}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have rendered with all children',
        <div className="comments" role="list">
          <ExpandComments omittedComments={p.omittedComments} />
          <PostComment />
        </div>,
      );
    });

    it(`should not show comment after omitted ones if it is not exist`, () => {
      const comments = genComments(1);
      expect(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have rendered with all children',
        <div className="comments" role="list">
          <PostComment />
          <ExpandComments omittedComments={post.omittedComments} />
        </div>,
      );
    });

    it(`should collapse extra comments after the fold`, () => {
      const extraComments = 3;
      const comments = genComments(1 + extraComments + commentsAfterFold);

      expect(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
        'when rendered',
        'to have rendered with all children',
        <div className="comments" role="list">
          <PostComment />
          <ExpandComments omittedComments={post.omittedComments + extraComments} />
          {genCommentElements(commentsAfterFold)}
        </div>,
      );
    });
  });

  describe('Folding and unfolding comments', () => {
    describe('Without omittedComments', () => {
      const post = { ...defaultPostData };

      it('should expand comments', () => {
        const nComments =
          1 + // first comment
          minFoldedComments + // folded comments
          commentsAfterFold; // comments after fold
        const comments = genComments(nComments);

        const renderer = createRenderer();
        renderer.render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={commentsAfterFold}
            minFoldedComments={minFoldedComments}
          />,
        );
        expect(renderer, 'to contain', <ExpandComments />);
        expect(
          renderer,
          'with event',
          'expand',
          'on',
          <ExpandComments />,
          'to have rendered with all children',
          <div className="comments" role="list">
            {genCommentElements(nComments)}
          </div>,
        );
      });

      it(`should allow to collapse comments back if there are ${minCommentsToFold} or more comments`, () => {
        const nComments = minCommentsToFold;
        const comments = genComments(nComments);
        const renderer = createRenderer();
        renderer.render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={commentsAfterFold}
            minFoldedComments={minFoldedComments}
          />,
        );
        expect(
          renderer,
          'with event',
          'expand',
          'on',
          <ExpandComments />,
          'to have rendered with all children',
          <div className="comments" role="list">
            {genCommentElements(1)}
            <CollapseComments />
            {genCommentElements(nComments - 1)}
          </div>,
        );
        expect(
          renderer,
          'with event',
          'collapse',
          'on',
          <CollapseComments />,
          'to have rendered with all children',
          <div className="comments" role="list">
            {genCommentElements(1)}
            <ExpandComments omittedComments={nComments - commentsAfterFold - 1} />
            {genCommentElements(commentsAfterFold)}
          </div>,
        );
      });
    });

    describe('With omittedComments', () => {
      const post = { ...defaultPostData, omittedCommentsOffset: 1, omittedComments: 3 };

      it('should start loading omitted comments on expand', () => {
        const extraCommentsAfterFold = 2;
        const nComments =
          1 + // first comment
          extraCommentsAfterFold +
          commentsAfterFold; // comments after fold
        const comments = genComments(nComments);

        const expandSpy = sinon.spy();

        const renderer = createRenderer();
        renderer.render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={commentsAfterFold}
            minFoldedComments={minFoldedComments}
            showMoreComments={expandSpy}
          />,
        );
        expect(
          renderer,
          'to contain',
          <ExpandComments omittedComments={post.omittedComments + extraCommentsAfterFold} />,
        );
        expect(
          renderer,
          'with event',
          'expand',
          'on',
          <ExpandComments />,
          'to have rendered with all children',
          <div className="comments" role="list">
            {genCommentElements(1)}
            <ExpandComments omittedComments={post.omittedComments + extraCommentsAfterFold} />
            {genCommentElements(commentsAfterFold)}
          </div>,
        );
        expect(expandSpy, 'to have a call satisfying', { args: [post.id] });
      });
    });
  });

  describe('Editing comments', () => {
    describe('Without omitted comments', () => {
      const post = { ...defaultPostData };

      it(`should render comments as usual when the first comment is editing`, () => {
        const comments = genComments(6);
        comments[0].isEditing = true;
        // E [* * *] * *

        expect(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={2}
            minFoldedComments={3}
          />,
          'when rendered',
          'to have rendered with all children',
          <div className="comments" role="list">
            <PostComment isEditing={true} />
            <ExpandComments omittedComments={3} />
            {genCommentElements(2)}
          </div>,
        );
      });

      it(`should not fold comments if there are too few unediting comments to fold`, () => {
        const comments = genComments(7);
        comments[3].isEditing = true;
        // * * * E * * *

        expect(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={2}
            minFoldedComments={3}
          />,
          'when rendered',
          'to have rendered with all children',
          <div className="comments" role="list">
            {genCommentElements(7, [3])}
          </div>,
        );
      });

      it(`should not fold any editing comments`, () => {
        const comments = genComments(9);
        comments[0].isEditing = true;
        comments[5].isEditing = true;
        comments[7].isEditing = true;
        // E [* * * *] E * E *

        expect(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={2}
            minFoldedComments={3}
          />,
          'when rendered',
          'to have rendered with all children',
          <div className="comments" role="list">
            <PostComment isEditing={true} />
            <ExpandComments omittedComments={4} />
            {genCommentElements(4, [0, 2])}
          </div>,
        );
      });
    });

    describe('With omitted comments', () => {
      const post = {
        ...defaultPostData,
        omittedComments: 2,
        omittedCommentsOffset: 1,
      };

      it(`should render comments as usual when the first comment is editing`, () => {
        const comments = genComments(5);
        comments[0].isEditing = true;
        // E [(2) * *] * *

        expect(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={2}
            minFoldedComments={3}
          />,
          'when rendered',
          'to have rendered with all children',
          <div className="comments" role="list">
            <PostComment isEditing={true} />
            <ExpandComments omittedComments={4} />
            {genCommentElements(2)}
          </div>,
        );
      });

      it(`should show editing comments rigth after the omitted`, () => {
        const comments = genComments(5);
        comments[0].isEditing = true;
        comments[1].isEditing = true;
        // E [(2)] E * * *

        expect(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={2}
            minFoldedComments={3}
          />,
          'when rendered',
          'to have rendered with all children',
          <div className="comments" role="list">
            <PostComment isEditing={true} />
            <ExpandComments omittedComments={2} />
            {genCommentElements(4, [0])}
          </div>,
        );
      });

      it(`should show editing comment right after the fold, the first comment is absent`, () => {
        const p = { ...post, omittedCommentsOffset: 0 };
        const comments = genComments(5);
        comments[1].isEditing = true;
        // [(2) *] E * * *

        expect(
          <PostComments comments={comments} post={p} commentsAfterFold={2} minFoldedComments={3} />,
          'when rendered',
          'to have rendered with all children',
          <div className="comments" role="list">
            <ExpandComments omittedComments={3} />
            {genCommentElements(4, [0])}
          </div>,
        );
      });
    });
  });
});

function genComments(n) {
  return Array(n)
    .fill(null)
    .map((_, i) => ({ id: `comm${i}`, isEditing: false, likes: 0 }));
}

function genCommentElements(n, editingIndices = []) {
  return Array(n)
    .fill(null)
    .map((_, i) => <PostComment key={i} isEditing={editingIndices.includes(i)} />);
}
