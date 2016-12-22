import React from 'react';

import VideoPreview, {canShowURL as videoCanShowURL} from './video';
import TwitterPreview, {canShowURL as twitterCanShowURL} from './twitter';
import InstagramPreview, {canShowURL as instagramCanShowURL} from './instagram';
import GoogleDocsPreview, {canShowURL as googleDocsCanShowURL} from './google-docs';
import EmbedlyPreview from './embedly';

export default function LinkPreview({ allowEmbedly, url }) {
  if (noPreviewForURL(url)) {
    return false;
  }
  if (videoCanShowURL(url)) {
    return <VideoPreview url={url} />;
  } else if (twitterCanShowURL(url)) {
    return <TwitterPreview url={url} />;
  } else if (instagramCanShowURL(url)) {
    return <InstagramPreview url={url} />;
  } else if (googleDocsCanShowURL(url)) {
    return <GoogleDocsPreview url={url} />;
  }

  if (allowEmbedly) {
    return <EmbedlyPreview url={url} />;
  }

  return false;
}

LinkPreview.propTypes = {
  allowEmbedly: React.PropTypes.bool.isRequired,
  url: React.PropTypes.string.isRequired,
};

function noPreviewForURL(url) {
  return /^https:\/\/([a-z0-9-]+\.)?freefeed\.net(\/|$)/i.test(url);
}
