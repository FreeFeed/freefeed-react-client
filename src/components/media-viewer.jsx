import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { renderToString } from 'react-dom/server';
import { showMedia } from '../redux/action-creators';
import { lazyComponent } from './lazy-component';
import { canShowURL, getVideoInfo } from './link-preview/video';

const ImageAttachmentsLightbox = lazyComponent(() => import('./post-attachment-image-lightbox'), {
  fallback: (
    <div className="lightbox-loading">
      <span>Loading lightbox...</span>
    </div>
  ),
  errorMessage: "Couldn't load lightbox component",
});

export const getMediaType = (url) => {
  if (url.match(/\.(jpg|png|jpeg|webp)$/i)) {
    return 'image';
  }

  if (canShowURL(url)) {
    return 'video';
  }
};

export const isMediaAttachment = (attachments) => {
  return attachments.reduce((acc, item) => acc || item.mediaType === 'image', false);
};

const getVideoItem = async (url, withoutAutoplay) => {
  const info = await getVideoInfo(url, withoutAutoplay);

  if (info) {
    let player = null;
    const w = 800;
    const h = info.aspectRatio ? Math.round(w * info.aspectRatio) : 450;
    const wrapperPadding = info.aspectRatio ? `${info.aspectRatio * 100}%` : null;

    if (info.playerURL) {
      player = (
        <iframe
          className="pswp__video"
          src={info.playerURL}
          frameBorder="0"
          allowFullScreen={true}
          width={w}
          height={h}
          allow="autoplay"
        />
      );
    } else if (info.videoURL) {
      player = (
        <video
          src={info.videoURL}
          poster={info.previewURL}
          autoPlay={!withoutAutoplay}
          controls={true}
          loop={true}
        />
      );
    }

    if (player) {
      const html = (
        <div className="wrapper">
          <div className="video-wrapper" style={{ paddingBottom: wrapperPadding }}>
            {player}
          </div>
        </div>
      );

      return {
        html: renderToString(html),
        w,
        h,
        pid: 'video',
        title: renderToString(
          <a href={url} target="_blank">
            {info.byline || url}
          </a>,
        ),
      };
    }
  }
};

function MediaViewer(props) {
  const { mediaViewer, showMedia } = props;
  const { attachments, postId, navigate, thumbnail, index } = mediaViewer;
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
          index: null,
          thumbnail: null,
        });
      }
    },
    [postId],
  );

  const getThumbnail = useCallback((index) => (thumbnail ? thumbnail(index) : null), [attachments]);

  useEffect(() => {
    if (attachments) {
      Promise.all(
        attachments.map(async (a, i) => {
          if (a.mediaType === 'video') {
            const videoItem = await getVideoItem(a.url, i !== index);
            if (videoItem) {
              return videoItem;
            }
          }
          return {
            src: a.url,
            w: (a.imageSizes && a.imageSizes.o && a.imageSizes.o.w) || 0,
            h: (a.imageSizes && a.imageSizes.o && a.imageSizes.o.h) || 0,
            pid: a.id.substr(0, 8),
          };
        }),
      ).then((items) => {
        setLightboxItems(items);
      });
    } else {
      setLightboxItems(null);
    }
  }, [attachments, index]);

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
