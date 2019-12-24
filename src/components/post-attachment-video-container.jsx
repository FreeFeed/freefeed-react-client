import React, { useState, useCallback } from 'react';
import classnames from 'classnames';
import Loadable from 'react-loadable';
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './fontawesome-icons';
import PostAttachmentVideo from './post-attachment-video';

const Sortable = Loadable({
  loading: ({ error }) => {
    if (error) {
      return <div>Cannot load Sortable component</div>;
    }
    return <div>Loading component...</div>;
  },
  loader: () => import('react-sortablejs'),
  delay: 500,
});

function VideoAttachmentsContainer(props) {
  const { attachments, isEditing, isSinglePost, removeAttachment, reorderImageAttachments } = props;
  const [isFolded, setIsFolded] = useState(true);
  const shouldFold = attachments.length > 1 && !isEditing && !isSinglePost;
  const withSortable = isEditing && attachments.length > 1;

  const toggleFolding = useCallback(
    (e) => {
      e.preventDefault();
      setIsFolded(!isFolded);
    },
    [isFolded],
  );

  const onSortChange = useCallback((order) => reorderImageAttachments(order), [
    reorderImageAttachments,
  ]);

  const className = classnames({
    'video-attachments': true,
    'is-folded': isFolded,
    'needs-folding': true,
    'sortable-images': withSortable,
  });

  const videos = attachments.map((video, i) => (
    <PostAttachmentVideo
      key={video.id}
      isHidden={shouldFold && isFolded && i}
      isEditing={isEditing}
      removeAttachment={removeAttachment}
      {...video}
    />
  ));

  return (
    <div className={className}>
      {withSortable ? <Sortable onChange={onSortChange}>{videos}</Sortable> : videos}
      {shouldFold && (
        <div className="show-more">
          <Icon
            icon={faChevronCircleRight}
            className="show-more-icon"
            onClick={toggleFolding}
            title={isFolded ? `Show more (${attachments.length - 1})` : 'Show less'}
          />
        </div>
      )}
    </div>
  );
}

export default VideoAttachmentsContainer;
