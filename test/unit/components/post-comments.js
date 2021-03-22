import { describe, it } from 'mocha';
import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';

import flatten from 'lodash/flatten';

import PostComments from '../../../src/components/post-comments';
import PostComment from '../../../src/components/post-comment';
import ErrorBoundary from '../../../src/components/error-boundary';
import ExpandComments from '../../../src/components/post-comments/expand-comments';
import { LoadingComments } from '../../../src/components/post-comments/loading-comments';
import { SignInLink } from '../../../src/components/sign-in-link';

const expect = unexpected.clone().use(unexpectedReact);

const generateArray = (n) => [...Array(n).keys()].map(() => ({}));
const commentArrays = generateArray(5).map((_, index) => generateArray(index));

describe('<PostComments>', () => {
  it(`should render first comment if there're any comments`, () => {
    const post = {
      omittedComments: 1,
      omittedCommentsOffset: 1,
      isCommenting: false,
      createdBy: { username: '' },
      user: {},
    };

    expect(
      <PostComments comments={[{}]} post={post} />,
      'when rendered',
      'to have rendered with all children',
      <div>
        <PostComment />
        <ExpandComments />
        <LoadingComments />
      </div>,
    );
  });

  it('should render right number of comments', async () => {
    const post = {
      omittedComments: 0,
      omittedCommentsOffset: 0,
      isCommenting: false,
      createdBy: { username: '' },
      user: {},
    };

    expect(
      <PostComments comments={[]} post={post} />,
      'when rendered',
      'to have rendered with all children',
      <div className="comments">
        <ErrorBoundary />
      </div>,
    );

    expect(
      <PostComments comments={[{}]} post={post} />,
      'when rendered',
      'to have rendered with all children',
      <div>
        <PostComment />
      </div>,
    );

    const root = await expect(
      <PostComments comments={[{}, {}, {}, {}]} post={post} />,
      'when rendered',
      'queried for',
      <div className="comments" />,
    );
    const errorBoundary = root.props.children;
    const comments = flatten(errorBoundary.props.children).filter(
      (tag) => tag?.type === PostComment,
    );
    expect(comments, 'to have length', 4);
  });

  it('should render omitted number properly', () => {
    const post = {
      omittedComments: 2,
      omittedCommentsOffset: 1,
      isCommenting: false,
      createdBy: { username: '' },
      user: {},
    };

    expect(
      <PostComments comments={[{}, {}]} post={post} />,
      'when rendered',
      'to contain',
      <ExpandComments omittedComments={2} />,
    );
  });

  it(`should not render omitted number when there're no omitted comments`, () => {
    commentArrays.map((comments) => {
      const post = {
        omittedComments: 0,
        omittedCommentsOffset: 0,
        isCommenting: false,
        createdBy: { username: '' },
        user: {},
      };
      expect(
        <PostComments comments={comments} post={post} />,
        'when rendered',
        'not to contain',
        <ExpandComments />,
      );
    });
  });

  it(`should render last comment if there's more than one comment`, () => {
    // not enough comments to show anything after "more"
    commentArrays.slice(0, 2).map((comments) => {
      const post = {
        omittedComments: 1,
        omittedCommentsOffset: 1,
        isCommenting: false,
        createdBy: { username: '' },
        user: {},
      };
      expect(
        <PostComments comments={comments} post={post} />,
        'when rendered',
        'not to contain',
        <div>
          <PostComment />
          <ExpandComments />
          <PostComment />
        </div>,
      );
    });

    // enough comments to show something after "more"
    commentArrays.slice(2).map((comments) => {
      const post = {
        omittedComments: 1,
        omittedCommentsOffset: 1,
        isCommenting: false,
        createdBy: { username: '' },
        user: {},
      };
      expect(
        <PostComments comments={comments} post={post} />,
        'when rendered',
        'to contain',
        <div>
          <PostComment />
          <ExpandComments />
          <PostComment />
        </div>,
      );
    });
  });

  it('should render commenting section only if post is commented', () => {
    const post = {
      omittedComments: 1,
      omittedCommentsOffset: 1,
      isCommenting: false,
      createdBy: { username: '' },
      user: {},
    };
    expect(
      <PostComments comments={[]} post={post} user={{ id: '12345' }} />,
      'when rendered',
      'not to contain',
      <PostComment isEditing={true} />,
    );

    post.isCommenting = true;
    expect(
      <PostComments comments={[]} post={post} user={{ id: '12345' }} />,
      'when rendered',
      'to contain',
      <PostComment isEditing={true} />,
    );
  });

  it('should render "Sign In" link if post is commented and user is anonymous', () => {
    const post = {
      omittedComments: 1,
      omittedCommentsOffset: 1,
      isCommenting: false,
      createdBy: { username: '' },
      user: {},
    };
    expect(
      <PostComments comments={[]} post={post} user={{}} />,
      'when rendered',
      'not to contain',
      <PostComment isEditing={true} />,
    );
    expect(
      <PostComments comments={[]} post={post} user={{}} />,
      'when rendered',
      'not to contain',
      <SignInLink>Sign In</SignInLink>,
    );

    post.isCommenting = true;
    expect(
      <PostComments comments={[]} post={post} user={{}} />,
      'when rendered',
      'to contain',
      <SignInLink>Sign In</SignInLink>,
    );
  });
});
