import { describe, it } from 'mocha';
import expect from 'unexpected';

import ShallowRenderer from 'react-test-renderer/shallow';
import clone from 'lodash/clone';

import PostLikes from '../../../src/components/post/post-likes';

describe('<PostLikes>', () => {
  const _likes = [];

  for (let i = 1; i <= 6; i++) {
    _likes.push({ id: `id${i}` });

    const likes = clone(_likes);
    it(`should render ${i} likes if nothing is omitted`, () => {
      const post = { omittedLikes: 0 };

      const renderer = new ShallowRenderer();
      renderer.render(<PostLikes {...{ likes, post }} />);

      const errorBoundary = renderer.getRenderOutput().props.children;
      expect(errorBoundary.props.children[1].props.children, 'to have length', i);
    });
  }

  it('should render number of omitted likes', () => {
    const likes = [{ id: 'id0' }];
    const post = { omittedLikes: 10 };

    const renderer = new ShallowRenderer();
    renderer.render(<PostLikes {...{ likes, post }} />);

    const errorBoundary = renderer.getRenderOutput().props.children;
    const likeList = errorBoundary.props.children[1].props.children;
    const lastLike = likeList[likeList.length - 1];
    const [ommitedLikesNode] = lastLike.props.children;
    const [ommitedLikesNumber] = ommitedLikesNode.props.children;

    expect(ommitedLikesNumber, 'to equal', 10);
  });
});
