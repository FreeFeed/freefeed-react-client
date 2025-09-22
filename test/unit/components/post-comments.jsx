import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';
import PostComments from '../../../src/components/post/post-comments';

const generateArray = (n) => [...Array(n).keys()].map((i) => ({ id: i }));
const commentArrays = generateArray(5).map((_, index) => generateArray(index));

describe('<PostComments>', () => {
  beforeAll(() => {
    vi.mock('../../../src/components/post/post-comment', () => ({
      default: (props) => <div data-testid="post-comment">{JSON.stringify(props)}</div>,
    }));
    vi.mock('../../../src/components/post/post-comments/expand-comments', () => ({
      default: (props) => <div data-testid="expand-comments">{JSON.stringify(props)}</div>,
    }));
    vi.mock('../../../src/components/post/post-comments/loading-comments', () => ({
      LoadingComments: (props) => <div data-testid="loading-comments">{JSON.stringify(props)}</div>,
    }));
    vi.mock('../../../src/components/sign-in-link', () => ({
      SignInLink: (props) => <div data-testid="sign-in-link">{JSON.stringify(props)}</div>,
    }));
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it(`should render first comment if there're any comments`, () => {
    const post = {
      omittedComments: 1,
      omittedCommentsOffset: 1,
      isCommenting: false,
      createdBy: { username: '' },
      user: {},
    };

    const { container } = render(<PostComments comments={[{ id: '1' }]} post={post} />);
    expect(container).toMatchSnapshot();
  });

  it('should render right number of comments', async () => {
    const post = {
      omittedComments: 0,
      omittedCommentsOffset: 0,
      isCommenting: false,
      createdBy: { username: '' },
      user: {},
    };

    {
      const { container } = render(<PostComments comments={[]} post={post} />);
      expect(container).toMatchSnapshot();
    }

    {
      const { container } = render(<PostComments comments={[{ id: '1' }]} post={post} />);
      expect(container).toMatchSnapshot();
    }

    {
      const { container } = render(
        <PostComments
          comments={[{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]}
          post={post}
        />,
      );
      expect(container).toMatchSnapshot();
    }
  });

  it('should render omitted number properly', () => {
    const post = {
      omittedComments: 2,
      omittedCommentsOffset: 1,
      isCommenting: false,
      createdBy: { username: '' },
      user: {},
    };

    const { container } = render(
      <PostComments comments={[{ id: '1' }, { id: '2' }]} post={post} />,
    );
    expect(container).toMatchSnapshot();
  });

  it(`should not render omitted number when there're no omitted comments`, () => {
    for (const comments of commentArrays) {
      const post = {
        omittedComments: 0,
        omittedCommentsOffset: 0,
        isCommenting: false,
        createdBy: { username: '' },
        user: {},
      };

      const { container } = render(<PostComments comments={comments} post={post} />);
      expect(container).toMatchSnapshot();
    }
  });

  it(`should render last comment if there's more than one comment`, () => {
    // not enough comments to show anything after "more"
    for (const comments of commentArrays.slice(0, 2)) {
      const post = {
        omittedComments: 1,
        omittedCommentsOffset: 1,
        isCommenting: false,
        createdBy: { username: '' },
        user: {},
      };

      const { container } = render(<PostComments comments={comments} post={post} />);
      expect(container).toMatchSnapshot();
    }

    // enough comments to show something after "more"
    for (const comments of commentArrays.slice(2)) {
      const post = {
        omittedComments: 1,
        omittedCommentsOffset: 1,
        isCommenting: false,
        createdBy: { username: '' },
        user: {},
      };

      const { container } = render(<PostComments comments={comments} post={post} />);
      expect(container).toMatchSnapshot();
    }
  });

  it('should render commenting section only if post is commented', () => {
    const post = {
      omittedComments: 1,
      omittedCommentsOffset: 1,
      isCommenting: false,
      createdBy: { username: '' },
      user: {},
    };

    {
      const { container } = render(
        <PostComments comments={[]} post={post} user={{ id: '12345' }} />,
      );
      expect(container).toMatchSnapshot();
    }

    post.isCommenting = true;

    {
      const { container } = render(
        <PostComments comments={[]} post={post} user={{ id: '12345' }} />,
      );
      expect(container).toMatchSnapshot();
    }
  });

  it('should render "Sign In" link if post is commented and user is anonymous', () => {
    const post = {
      omittedComments: 1,
      omittedCommentsOffset: 1,
      isCommenting: false,
      createdBy: { username: '' },
      user: {},
    };

    render(<PostComments comments={[]} post={post} user={{ id: '12345' }} />);
    expect(screen.queryByTestId('sign-in-link')).not.toBeInTheDocument();

    cleanup();
    post.isCommenting = true;

    render(<PostComments comments={[]} post={post} user={{}} />);
    expect(screen.queryByTestId('sign-in-link')).toBeInTheDocument();
  });
});
