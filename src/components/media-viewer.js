import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
import { showMedia } from '../redux/action-creators';

const ImageAttachmentsLightbox = Loadable({
  loading: ({ error, pastDelay }) => {
    if (error) {
      console.error(`Cannot load 'post-attachment-image-lightbox'`, error); // eslint-disable-line no-console
      return <div style={{ color: 'red' }}>Cannot load lightbox. Please try again.</div>;
    }
    if (pastDelay) {
      return (
        <div className="lightbox-loading">
          <span>Loading lightbox...</span>
        </div>
      );
    }
    return null;
  },
  loader: () => import('./post-attachment-image-lightbox'),
  delay: 500,
  timeout: 10000,
});

export const isMediaUrl = (url) => {
  return url.match(/\.(jpg|png|jpeg|webp)$/i);
};

export const isMediaAttachment = (attachments) => {
  return attachments.reduce((acc, item) => acc || item.mediaType === 'image', false);
};

function MediaViewer(props) {
  const { mediaViewer, showMedia } = props;
  const { attachments, postId, navigate, thumbnail } = mediaViewer;
  const [lightboxItems, setLightboxItems] = useState(null);

  const onDestroy = useCallback(() => {
    // setLightboxItems(null);
    showMedia({});
  }, []);

  const onNavigate = useCallback(
    (where) => {
      const nextPost = typeof navigate === 'function' ? navigate(postId, where) : null;
      if (nextPost) {
        props.showMedia({
          ...mediaViewer,
          postId: nextPost.id,
          attachments: nextPost.attachments,
          index: 0,
          thumbnail: null,
        });
      }
    },
    [postId],
  );

  const getThumbnail = useCallback((index) => (thumbnail ? thumbnail(index) : null), [attachments]);

  useEffect(() => {
    if (attachments) {
      setLightboxItems(
        attachments.map((a) => ({
          src: a.url,
          w: (a.imageSizes && a.imageSizes.o && a.imageSizes.o.w) || 0,
          h: (a.imageSizes && a.imageSizes.o && a.imageSizes.o.h) || 0,
          pid: a.id.substr(0, 8),
        })),
      );
    } else {
      setLightboxItems(null);
    }
  }, [attachments]);

  if (!lightboxItems) {
    return null;
  }

  return (
    <ImageAttachmentsLightbox
      items={lightboxItems}
      index={mediaViewer.index || 0}
      postId={postId}
      getThumbnail={getThumbnail}
      onDestroy={onDestroy}
      onNavigate={onNavigate}
    />
  );
}

function mapStateToProps(state) {
  return {
    mediaViewer: state.mediaViewer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showMedia: (params) => dispatch(showMedia(params)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MediaViewer);
