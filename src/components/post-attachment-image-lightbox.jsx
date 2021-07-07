import pt from 'prop-types';
import { Component } from 'react';
import { PhotoSwipe } from 'react-photoswipe';
import Mousetrap from 'mousetrap';
import { pinnedElements, unscrollTo } from '../services/unscroll';

const prevHotKeys = ['a', 'ф', 'h', 'р', '4'];
const nextHotKeys = ['d', 'в', 'k', 'л', '6'];
const prevPostKeys = ['w', 'ц', 'up', 'u', 'г', '8'];
const nextPostKeys = ['s', 'ы', 'down', 'j', 'о', '2'];

const lightboxOptions = {
  shareEl: false,
  clickToCloseNonZoomable: false,
  bgOpacity: 0.8,
  galleryPIDs: true,
};

const isiOSChrome = window?.navigator?.userAgent?.match('CriOS') || false;

export default class ImageAttachmentsLightbox extends Component {
  static propTypes = {
    items: pt.arrayOf(
      pt.shape({
        src: pt.string,
        html: pt.string,
        w: pt.number.isRequired,
        h: pt.number.isRequired,
        pid: pt.string.isRequired,
      }),
    ).isRequired,
    postId: pt.string,
    index: pt.number.isRequired,
    getThumbnail: pt.func.isRequired,
    onDestroy: pt.func.isRequired,
  };

  state = { currentIndex: 0 };

  constructor(props) {
    super(props);
    this.state.currentIndex = props.index;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.postId !== this.props.postId) {
      if (this.photoSwipe) {
        this.photoSwipe.goTo(0);
      }
    }
  }

  photoSwipe = null;
  pinnedEls = [];

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
          item.h = (rect.height * item.w) / rect.width;
        }
      } else if (item.src) {
        item.src = item.src
          // Convert dropbox page URL to image URL
          .replace('https://www.dropbox.com/s/', 'https://dl.dropboxusercontent.com/s/');
        // lets try to find out image size when image loads
        const image = new Image();
        item.w = 1;
        item.h = 1;
        image.onload = () => {
          item.w = image.width; // set image width
          item.h = image.height;
          this.photoSwipe.invalidateCurrItems();
          this.photoSwipe.updateSize(true);
        };
        image.src = item.src;
      }
    }
    if (!item.msrc && thumb) {
      item.msrc = thumb.currentSrc;
    }
  };

  afterChange = (_) => {
    const index = _.getCurrentIndex();
    const prevIndex = this.prevIndex || 0;

    if (index !== prevIndex) {
      const { items } = _;

      if (items[prevIndex].html) {
        if (!items[prevIndex].htmlCopy) {
          items[prevIndex].htmlCopy = items[prevIndex].html;
        }
        items[prevIndex].html = '<div></div>';
        if (!this.reloading) {
          this.reloading = 'reload';
        }
      }

      if (items[index].html) {
        if (items[index].htmlCopy) {
          items[index].html = items[index].htmlCopy;
          if (!this.reloading) {
            this.reloading = 'reload';
          }
        }
      }

      if (this.reloading === 'reload') {
        this.reloading = 'reloading';
        _.invalidateCurrItems();
        _.updateSize(true);
      } else {
        this.reloading = false;
      }
    }

    this.prevIndex = index;
  };

  navigatePost = (where, e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.onNavigate(where);
  };

  whenOpened = () => {
    Mousetrap.bind(prevHotKeys, () => this.photoSwipe.prev());
    Mousetrap.bind(nextHotKeys, () => this.photoSwipe.next());
    Mousetrap.bind(prevPostKeys, (e) => this.navigatePost(-1, e));
    Mousetrap.bind(nextPostKeys, (e) => this.navigatePost(1, e));
  };

  whenClosed = () => {
    Mousetrap.unbind(prevHotKeys);
    Mousetrap.unbind(nextHotKeys);
    Mousetrap.unbind(prevPostKeys);
    Mousetrap.unbind(nextPostKeys);
  };

  registerPhotoSwipe = (el) => {
    this.photoSwipe = el ? el.photoSwipe : null;
  };

  onClose = () => {
    if (isiOSChrome) {
      pinnedElements.capture();
      this.pinnedEls = [...pinnedElements];
    }
    this.whenClosed();
  };

  onDestroy = () => {
    this.props.onDestroy();
    if (isiOSChrome) {
      const h = () => unscrollTo(this.pinnedEls);
      window.addEventListener('scroll', h, { once: true });
      setTimeout(() => window.removeEventListener('scroll', h), 500);
    }
  };

  render() {
    return (
      <PhotoSwipe
        ref={this.registerPhotoSwipe}
        items={this.props.items}
        gettingData={this.getItemData}
        options={{
          ...lightboxOptions,
          galleryUID: (this.props.postId || 'new-post').slice(0, 8),
          getThumbBoundsFn: this.getThumbBounds,
          index: this.state.currentIndex,
        }}
        isOpen={true}
        initialZoomInEnd={this.whenOpened}
        destroy={this.onDestroy}
        close={this.onClose}
        afterChange={this.afterChange}
      />
    );
  }
}
