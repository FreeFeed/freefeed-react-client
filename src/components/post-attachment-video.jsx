import React, { useCallback } from 'react';
import classnames from 'classnames';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './fontawesome-icons';

function PostAttachmentVideo(props) {
  const { isEditing, isHidden, removeAttachment, id, url } = props;

  const handleRemoveImage = useCallback(() => {
    removeAttachment(id);
  }, [removeAttachment, id]);

  return (
    <div className={classnames({ attachment: true, hidden: isHidden })} data-id={id}>
      <video className="video-preview" src={url} controls={1} />
      {isEditing && (
        <Icon
          icon={faTimes}
          className="remove-attachment"
          title="Remove image"
          onClick={handleRemoveImage}
        />
      )}
    </div>
  );
}

export default PostAttachmentVideo;
