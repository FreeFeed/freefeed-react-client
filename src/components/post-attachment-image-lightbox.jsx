import pt from 'prop-types';
import React from 'react';
import { PhotoSwipe } from 'react-photoswipe';
import Mousetrap from 'mousetrap';

const prevHotKeys = ['a', 'ф', 'h', 'р', '4'];
const nextHotKeys = ['d', 'в', 'k', 'л', '6'];

const lightboxOptions = {
  shareEl: false,
  clickToCloseNonZoomable: false,
  bgOpacity: 0.8,
  galleryPIDs: true,
};

export default class ImageAttachmentsLightbox extends React.Component {
  static propTypes = {
    items: pt.arrayOf(pt.shape({
      src: pt.string.isRequired,
      w: pt.number.isRequired,
      h: pt.number.isRequired,
      pid: pt.string.isRequired,
    })).isRequired,
    postId: pt.string,
    getThumbnail: pt.func.isRequired,
  };

  state = {
    isOpened: false,
    currentIndex: 0,
  };

  photoSwipe = null;

  getThumbBounds = (index) => {
    const thumb = this.props.getThumbnail(index);
    if (!thumb) {
      return null;
    }
    const rect = thumb.getBoundingClientRect();
    if (rect.width === 0) {
      return null;
    }
    const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
    return {
      x: rect.left,
      y: rect.top + pageYScroll,
      w: rect.width,
    };
  };

  // react-photoswipe passes 'this' as a first argument unlike the PhotoSwipe API
  getItemData = (_, index, item) => {
    const thumb = this.props.getThumbnail(index);
    // for the old images without sizes
    // trying to obtain aspect ratio from thumbnail
    if (item.w === 0) {
      item.w = 800;
      item.h = 600;
      if (thumb) {
        const rect = thumb.getBoundingClientRect();
        if (rect.width > 0) {
          item.h = rect.height * item.w / rect.width;
        }
      }
    }
    if (!item.msrc && thumb) {
      item.msrc = thumb.currentSrc;
    }
  };

  whenOpened = () => {
    Mousetrap.bind(prevHotKeys, () => this.photoSwipe.prev());
    Mousetrap.bind(nextHotKeys, () => this.photoSwipe.next());
  };

  whenClosed = () => {
    this.setState({ isOpened: false });

    Mousetrap.unbind(prevHotKeys);
    Mousetrap.unbind(nextHotKeys);
  };

  open(index) {
    this.setState({
      isOpened: true,
      currentIndex: index,
    });
  }

  registerPhotoSwipe = (el) => {
    this.photoSwipe = el ? el.photoSwipe : null;
  };

  render() {
    return (
      <PhotoSwipe
        ref={this.registerPhotoSwipe}
        items={this.props.items}
        gettingData={this.getItemData}
        options={{
          ...lightboxOptions,
          galleryUID: (this.props.postId || 'new-post').substr(0, 8),
          getThumbBoundsFn: this.getThumbBounds,
          index: this.state.currentIndex,
        }}
        isOpen={this.state.isOpened}
        onClose={this.whenClosed}
        initialZoomInEnd={this.whenOpened}
      />
    );
  }
}
