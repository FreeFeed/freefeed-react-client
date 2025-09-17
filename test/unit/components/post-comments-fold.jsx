/* global CONFIG */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import PostComments from '../../../src/components/post/post-comments';

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

  // Mocking components: PostComment and LoadingComments
  beforeAll(() => {
    vi.mock('../../../src/components/post/post-comment', () => ({
      default: (props) => <div data-testid="post-comment">{JSON.stringify(props)}</div>,
    }));
    vi.mock('../../../src/components/post/post-comments/loading-comments', () => ({
      LoadingComments: (props) => <div data-testid="loading-comments">{JSON.stringify(props)}</div>,
    }));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('Post without omitted comments', () => {
    const post = { ...defaultPostData };

    it(`should render post without comments`, () => {
      const comments = genComments(0);

      render(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );
      expect(screen.queryAllByTestId('post-comment')).toHaveLength(0);
    });

    it(`should render post with one comment`, () => {
      const comments = genComments(1);

      render(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );
      expect(screen.queryAllByTestId('post-comment')).toHaveLength(1);
    });

    it(`should render post with two comments`, () => {
      const comments = genComments(2);

      render(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );

      expect(screen.queryAllByTestId('post-comment')).toHaveLength(2);
    });

    it(`should render post with three comments`, () => {
      const comments = genComments(3);

      render(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );

      expect(screen.queryAllByTestId('post-comment')).toHaveLength(3);
    });

    it(`should not fold comments if its count is below the limit`, () => {
      const nComments =
        1 + // first comment
        minFoldedComments + // folded comments
        commentsAfterFold + // comments after fold
        -1;
      const comments = genComments(nComments);

      render(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );

      expect(screen.queryAllByTestId('post-comment')).toHaveLength(nComments);
    });

    it(`should fold comments if there are too many of them`, () => {
      const nComments =
        1 + // first comment
        minFoldedComments + // folded comments
        commentsAfterFold; // comments after fold
      const comments = genComments(nComments);
      comments[1].likes = 2;
      comments[2].likes = 3;

      const { container } = render(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );

      const commentsEl = container.querySelector('.comments');
      expect(commentsEl.children).toHaveLength(4);
      expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[0].textContent).toContain(`"id":"comm0"`);
      expect(commentsEl.children[1]).toHaveTextContent('3 more comments with 5 likes');
      expect(commentsEl.children[2]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[2].textContent).toContain(`"id":"comm4"`);
      expect(commentsEl.children[3]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[3].textContent).toContain(`"id":"comm5"`);
    });

    it(`should not fold comments if its count is above the limit but the post is just created`, () => {
      const nComments =
        1 + // first comment
        minFoldedComments + // folded comments
        commentsAfterFold + // comments after fold
        +2;
      const comments = genComments(nComments);

      render(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
          preopened
        />,
      );

      expect(screen.queryAllByTestId('post-comment')).toHaveLength(nComments);
    });
  });

  describe('Post with omitted comments', () => {
    const post = {
      ...defaultPostData,
      omittedComments: 2,
      omittedCommentsOffset: 1,
    };

    it(`should render post with one comment after fold`, () => {
      const { container } = render(
        <PostComments
          comments={genComments(2)}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );

      const commentsEl = container.querySelector('.comments');
      expect(commentsEl.children).toHaveLength(3);
      expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[0].textContent).toContain(`"id":"comm0"`);
      expect(commentsEl.children[1]).toHaveTextContent('2 more comments');
      expect(commentsEl.children[2]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[2].textContent).toContain(`"id":"comm1"`);
    });

    it(`should render post with ${commentsAfterFold} comments after fold`, () => {
      const comments = genComments(commentsAfterFold + 1);

      const { container } = render(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );
      const commentsEl = container.querySelector('.comments');
      expect(commentsEl.children).toHaveLength(commentsAfterFold + 2);

      expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[0].textContent).toContain(`"id":"comm0"`);

      expect(commentsEl.children[1]).toHaveTextContent('2 more comments');

      for (let i = 0; i < commentsAfterFold; i++) {
        expect(commentsEl.children[i + 2]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[i + 2].textContent).toContain(`"id":"comm${i + 1}"`);
      }
    });

    it(`should render post with 3 comments after omitted`, () => {
      const comments = genComments(4);

      const p = { ...post, omittedCommentLikes: 5 };

      comments[1].likes = 2;

      const { container } = render(
        <PostComments comments={comments} post={p} commentsAfterFold={2} minFoldedComments={3} />,
      );

      const commentsEl = container.querySelector('.comments');
      expect(commentsEl.children).toHaveLength(4);

      expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[0].textContent).toContain(`"id":"comm0"`);

      expect(commentsEl.children[1]).toHaveTextContent('3 more comments with 7 likes');

      expect(commentsEl.children[2]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[2].textContent).toContain(`"id":"comm2"`);

      expect(commentsEl.children[3]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[3].textContent).toContain(`"id":"comm3"`);
    });

    it(`should not show comment before omitted ones if it is not exist`, () => {
      const p = { ...post, omittedCommentsOffset: 0 };

      const comments = genComments(1);

      const { container } = render(
        <PostComments
          comments={comments}
          post={p}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );

      const commentsEl = container.querySelector('.comments');
      expect(commentsEl.children).toHaveLength(3);

      expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'loading-comments');
      expect(commentsEl.children[1]).toHaveTextContent(`${p.omittedComments} more comments`);
      expect(commentsEl.children[2]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[2].textContent).toContain(`"id":"comm0"`);
    });

    it(`should not show comment after omitted ones if it is not exist`, () => {
      const comments = genComments(1);

      const { container } = render(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );

      const commentsEl = container.querySelector('.comments');
      expect(commentsEl.children).toHaveLength(3);

      expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[0].textContent).toContain(`"id":"comm0"`);
      expect(commentsEl.children[1]).toHaveTextContent(`${post.omittedComments} more comments`);
      expect(commentsEl.children[2]).toHaveAttribute('data-testid', 'loading-comments');
    });

    it(`should collapse extra comments after the fold`, () => {
      const extraComments = 3;

      const comments = genComments(1 + extraComments + commentsAfterFold);

      const { container } = render(
        <PostComments
          comments={comments}
          post={post}
          commentsAfterFold={commentsAfterFold}
          minFoldedComments={minFoldedComments}
        />,
      );

      const commentsEl = container.querySelector('.comments');

      expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'post-comment');
      expect(commentsEl.children[0].textContent).toContain(`"id":"comm0"`);
      expect(commentsEl.children[1]).toHaveTextContent(
        `${post.omittedComments + extraComments} more comments`,
      );
      for (let i = 0; i < commentsAfterFold; i++) {
        expect(commentsEl.children[i + 2]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[i + 2].textContent).toContain(`"id":"comm${i + 4}"`);
      }
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

        render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={commentsAfterFold}
            minFoldedComments={minFoldedComments}
          />,
        );

        const expandButton = screen.queryByRole('button', { name: /more comments/ });
        expect(expandButton).toBeInTheDocument();

        act(() => void expandButton.click());

        expect(screen.queryAllByTestId('post-comment')).toHaveLength(nComments);
      });

      it(`should allow to collapse comments back if there are ${CONFIG.commentsFolding.minToCollapse} or more comments`, () => {
        const nComments = CONFIG.commentsFolding.minToCollapse;

        const comments = genComments(nComments);

        render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={commentsAfterFold}
            minFoldedComments={minFoldedComments}
          />,
        );

        const expandButton = screen.queryByRole('button', { name: /more comments/ });
        expect(expandButton).toBeInTheDocument();

        act(() => void expandButton.click());

        expect(screen.queryAllByTestId('post-comment')).toHaveLength(nComments);
        expect(screen.queryByRole('button', { name: /more comments/ })).not.toBeInTheDocument();

        const collapseButton = screen.queryByRole('button', { name: 'Fold comments' });
        expect(collapseButton).toBeInTheDocument();

        act(() => void collapseButton.click());

        expect(screen.queryAllByTestId('post-comment')).toHaveLength(1 + commentsAfterFold);
        expect(screen.queryByRole('button', { name: 'Fold comments' })).not.toBeInTheDocument();
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

        const expandSpy = vi.fn();
        render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={commentsAfterFold}
            minFoldedComments={minFoldedComments}
            showMoreComments={expandSpy}
          />,
        );

        const expandButton = screen.queryByRole('button', { name: /more comments/ });
        expect(expandButton).toBeInTheDocument();
        expect(expandButton).toHaveTextContent(
          `${post.omittedComments + extraCommentsAfterFold} more comments`,
        );

        act(() => void expandButton.click());

        expect(expandSpy).toHaveBeenCalledWith(post.id);
        expect(screen.queryAllByTestId('post-comment')).toHaveLength(1 + commentsAfterFold);
      });
    });
  });

  describe('Editing comments', () => {
    describe('Without omitted comments', () => {
      const post = { ...defaultPostData };

      it(`should render comments as usual when the first comment is editing`, () => {
        const comments = genComments(6);

        comments[0].isEditing = true;

        // Comments order:
        // E [* * *] * *

        const { container } = render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={2}
            minFoldedComments={3}
          />,
        );

        const commentsEl = container.querySelector('.comments');
        expect(commentsEl.children).toHaveLength(4);

        // First comment (editing)
        expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[0].textContent).toContain(`"id":"comm0"`);

        // Expand button for folded comments
        expect(commentsEl.children[1]).toHaveTextContent('3 more comments');

        // Last 2 comments after fold
        expect(commentsEl.children[2]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[2].textContent).toContain(`"id":"comm4"`);
        expect(commentsEl.children[3]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[3].textContent).toContain(`"id":"comm5"`);
      });

      it(`should not fold comments if there are too few unediting comments to fold`, () => {
        const comments = genComments(7);

        comments[3].isEditing = true;

        // Comments order:
        // * * * E * * *

        const { container } = render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={2}
            minFoldedComments={3}
          />,
        );

        const commentsEl = container.querySelector('.comments');
        expect(commentsEl.children).toHaveLength(7);

        // All 7 comments should be rendered without folding
        for (let i = 0; i < 7; i++) {
          expect(commentsEl.children[i]).toHaveAttribute('data-testid', 'post-comment');
          expect(commentsEl.children[i].textContent).toContain(`"id":"comm${i}"`);

          // Check editing state - comment 3 should be editing
          if (i === 3) {
            expect(commentsEl.children[i].textContent).toContain('"isEditing":true');
          } else {
            expect(commentsEl.children[i].textContent).toContain('"isEditing":false');
          }
        }
      });

      it(`should not fold any editing comments`, () => {
        const comments = genComments(9);

        comments[0].isEditing = true;
        comments[5].isEditing = true;
        comments[7].isEditing = true;

        // Comments order:
        // E [* * * *] E * E *

        const { container } = render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={2}
            minFoldedComments={3}
          />,
        );

        const commentsEl = container.querySelector('.comments');
        expect(commentsEl.children).toHaveLength(6);

        // First comment (editing)
        expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[0].textContent).toContain(`"id":"comm0"`);
        expect(commentsEl.children[0].textContent).toContain('"isEditing":true');

        // Expand button for folded comments
        expect(commentsEl.children[1]).toHaveTextContent('4 more comments');

        // Comments after fold: comm5 (editing), comm6, comm7 (editing), comm8
        expect(commentsEl.children[2]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[2].textContent).toContain(`"id":"comm5"`);
        expect(commentsEl.children[2].textContent).toContain('"isEditing":true');

        expect(commentsEl.children[3]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[3].textContent).toContain(`"id":"comm6"`);
        expect(commentsEl.children[3].textContent).toContain('"isEditing":false');

        expect(commentsEl.children[4]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[4].textContent).toContain(`"id":"comm7"`);
        expect(commentsEl.children[4].textContent).toContain('"isEditing":true');

        expect(commentsEl.children[5]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[5].textContent).toContain(`"id":"comm8"`);
        expect(commentsEl.children[5].textContent).toContain('"isEditing":false');
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

        // Comments order:
        // E [(2) * *] * *

        const { container } = render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={2}
            minFoldedComments={3}
          />,
        );

        const commentsEl = container.querySelector('.comments');
        expect(commentsEl.children).toHaveLength(4);

        // First comment (editing)
        expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[0].textContent).toContain(`"id":"comm0"`);
        expect(commentsEl.children[0].textContent).toContain('"isEditing":true');

        // Expand button for omitted comments
        expect(commentsEl.children[1]).toHaveTextContent('4 more comments');

        // Comments after omitted: comm3, comm4
        expect(commentsEl.children[2]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[2].textContent).toContain(`"id":"comm3"`);
        expect(commentsEl.children[2].textContent).toContain('"isEditing":false');

        expect(commentsEl.children[3]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[3].textContent).toContain(`"id":"comm4"`);
        expect(commentsEl.children[3].textContent).toContain('"isEditing":false');
      });

      it(`should show editing comments rigth after the omitted`, () => {
        const comments = genComments(5);

        comments[0].isEditing = true;
        comments[1].isEditing = true;

        // Comments order:
        // E [(2)] E * * *

        const { container } = render(
          <PostComments
            comments={comments}
            post={post}
            commentsAfterFold={2}
            minFoldedComments={3}
          />,
        );

        const commentsEl = container.querySelector('.comments');
        expect(commentsEl.children).toHaveLength(6);

        // First comment (editing)
        expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[0].textContent).toContain(`"id":"comm0"`);
        expect(commentsEl.children[0].textContent).toContain('"isEditing":true');

        // Expand button for omitted comments
        expect(commentsEl.children[1]).toHaveTextContent('2 more comments');

        // Comments after omitted: comm1 (editing), comm2, comm3, comm4
        expect(commentsEl.children[2]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[2].textContent).toContain(`"id":"comm1"`);
        expect(commentsEl.children[2].textContent).toContain('"isEditing":true');

        expect(commentsEl.children[3]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[3].textContent).toContain(`"id":"comm2"`);
        expect(commentsEl.children[3].textContent).toContain('"isEditing":false');

        expect(commentsEl.children[4]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[4].textContent).toContain(`"id":"comm3"`);
        expect(commentsEl.children[4].textContent).toContain('"isEditing":false');

        expect(commentsEl.children[5]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[5].textContent).toContain(`"id":"comm4"`);
        expect(commentsEl.children[5].textContent).toContain('"isEditing":false');
      });

      it(`should show editing comment right after the fold, the first comment is absent`, () => {
        const p = { ...post, omittedCommentsOffset: 0 };

        const comments = genComments(5);

        comments[1].isEditing = true;

        // Comments order:
        // [(2) *] E * * *

        const { container } = render(
          <PostComments comments={comments} post={p} commentsAfterFold={2} minFoldedComments={3} />,
        );

        const commentsEl = container.querySelector('.comments');
        expect(commentsEl.children).toHaveLength(6);

        // Loading comments placeholder
        expect(commentsEl.children[0]).toHaveAttribute('data-testid', 'loading-comments');

        // Expand button for omitted comments
        expect(commentsEl.children[1]).toHaveTextContent('3 more comments');

        // Comments after omitted: comm1 (editing), comm2, comm3, comm4
        expect(commentsEl.children[2]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[2].textContent).toContain(`"id":"comm1"`);
        expect(commentsEl.children[2].textContent).toContain('"isEditing":true');

        expect(commentsEl.children[3]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[3].textContent).toContain(`"id":"comm2"`);
        expect(commentsEl.children[3].textContent).toContain('"isEditing":false');

        expect(commentsEl.children[4]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[4].textContent).toContain(`"id":"comm3"`);
        expect(commentsEl.children[4].textContent).toContain('"isEditing":false');

        expect(commentsEl.children[5]).toHaveAttribute('data-testid', 'post-comment');
        expect(commentsEl.children[5].textContent).toContain(`"id":"comm4"`);
        expect(commentsEl.children[5].textContent).toContain('"isEditing":false');
      });
    });
  });
});

function genComments(n) {
  return Array(n)
    .fill(null)

    .map((_, i) => ({ id: `comm${i}`, isEditing: false, likes: 0 }));
}
