import { describe, it } from 'mocha';
import expect from 'unexpected';

import { posts, createPostForm } from '../../../../src/redux/reducers';
import { reorderImageAttachments } from '../../../../src/redux/action-creators';


describe("Attachments reorder", () => {
  describe("posts()", () => {
    const state = { post1: { id: 'post1', attachments: ['att1', 'att2', 'att3'] } };

    it('should not touch state if postId is null', () => {
      const action = reorderImageAttachments(null, ['att3', 'att2']);
      const newState = posts(state, action);
      expect(newState, 'to be', state);
    });

    it('should not touch state if postId is not found', () => {
      const action = reorderImageAttachments('post3', ['att3', 'att2']);
      const newState = posts(state, action);
      expect(newState, 'to be', state);
    });

    it('should move reordered attachments to the start of the list in the given order', () => {
      const action = reorderImageAttachments('post1', ['att3', 'att2']);
      const newState = posts(state, action);
      expect(newState, 'to equal', { post1: { id: 'post1', attachments: ['att3', 'att2', 'att1'] } });
    });
  });

  describe("createPostForm()", () => {
    const state = { attachments: ['att1', 'att2', 'att3'] };

    it('should not touch state if postId is not null', () => {
      const action = reorderImageAttachments('post1', ['att3', 'att2']);
      const newState = createPostForm(state, action);
      expect(newState, 'to be', state);
    });

    it('should move reordered attachments to the start of the list in the given order', () => {
      const action = reorderImageAttachments(null, ['att3', 'att2']);
      const newState = createPostForm(state, action);
      expect(newState, 'to equal', { attachments: ['att3', 'att2', 'att1'] });
    });
  });
});
