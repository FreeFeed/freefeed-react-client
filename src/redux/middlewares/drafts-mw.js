import {
  deleteAllDrafts,
  doneEditing,
  doneEditingAndDeleteDraft,
  initializeDrafts,
} from '../../services/drafts';
import { LOCATION_CHANGE } from '../../services/nouter/redux';
import { response } from '../action-helpers';
import {
  ADD_COMMENT,
  CREATE_POST,
  INITIAL_WHO_AM_I,
  SAVE_EDITING_COMMENT,
  SAVE_EDITING_POST,
  UNAUTHENTICATED,
} from '../action-types';

export const draftsMiddleware = (store) => {
  return (next) => (action) => {
    switch (action.type) {
      // Load drafts on page load or sign up
      case response(INITIAL_WHO_AM_I): {
        initializeDrafts(store);
        break;
      }

      // Delete drafts on successful form submit
      case response(CREATE_POST): {
        doneEditingAndDeleteDraft(action.request.more.draftKey);
        break;
      }
      case response(ADD_COMMENT): {
        const { draftKey } = action.request;
        draftKey && doneEditingAndDeleteDraft(draftKey);
        break;
      }
      case response(SAVE_EDITING_POST): {
        doneEditingAndDeleteDraft(action.request.newPost.draftKey);
        break;
      }
      case response(SAVE_EDITING_COMMENT): {
        const { draftKey } = action.request;
        draftKey && doneEditingAndDeleteDraft(draftKey);
        break;
      }

      // Reset active draft on navigation
      case LOCATION_CHANGE: {
        doneEditing(null);
        break;
      }

      // Clear all drafts on log out
      case UNAUTHENTICATED: {
        deleteAllDrafts();
        break;
      }
    }
    return next(action);
  };
};
