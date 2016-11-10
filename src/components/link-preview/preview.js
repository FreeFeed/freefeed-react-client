import React from 'react';

import EmbedlyPreview from './embedly';

export default function LinkPreview({url}) {
  if (noPreviewForURL(url)) {
    return false;
  }
  return <EmbedlyPreview url={url} />;
}

LinkPreview.propTypes = {
  url: React.PropTypes.string.isRequired,
};

function noPreviewForURL(url) {
  return /^https:\/\/([a-z0-9-]+\.)?freefeed\.net(\/|$)/i.test(url);
}
