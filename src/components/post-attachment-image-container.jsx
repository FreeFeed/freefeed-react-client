import React from 'react';
import classnames from 'classnames';
import {PhotoSwipe} from 'react-photoswipe';
import Mousetrap from 'mousetrap';
import ImageAttachment from './post-attachment-image';

const bordersSize = 4;
const spaceSize = 8;
const arrowSize = 24;

const prevHotKeys = ['a', 'ф', 'h', 'р', '4'];
const nextHotKeys = ['d', 'в', 'k', 'л', '6'];

export default class PostAttachmentsImage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      containerWidth: 0,
      isFolded: true,
      needsFolding: false,
      isLightboxOpen: false,
      lightboxIndex: 0
    };

    this.itemWidths = props.attachments.map(({imageSizes: {t, o}}) => t ? t.w : (o ? o.w : 0)).map(w => w + bordersSize + spaceSize);
    this.contentWidth = this.itemWidths.reduce((s, w) => s + w, 0);
    this.container = null;
    this.photoSwipe = null;

    this.lightboxItems = this.props.attachments.map(a => ({
      src: a.url,
      w: a.imageSizes && a.imageSizes.o && a.imageSizes.o.w || 0,
      h: a.imageSizes && a.imageSizes.o && a.imageSizes.o.h || 0,
      msrc: null,
      thumb: null,
    }));

    this.lightboxOptions = {
      shareEl: false,
      clickToCloseNonZoomable: false,
      bgOpacity: 0.8,
      history: false,
      getThumbBoundsFn: this.getThumbBounds
    };
  }

  handleResize = () => {
    if (this.props.attachments.length == 1) {
      return;
    }
    const containerWidth = this.container.scrollWidth;
    if (containerWidth !== this.state.containerWidth) {
      this.setState({
        containerWidth,
        needsFolding: containerWidth < this.contentWidth
      });
    }
  }

  toggleFolding = () => {
    this.setState({isFolded: !this.state.isFolded});
  }

  getThumbBounds = (index) => {
    if (!this.lightboxItems[index] || !this.lightboxItems[index].thumb) {
      return null;
    }
    const rect = this.lightboxItems[index].thumb.getBoundingClientRect();
    if (rect.width === 0) {
      return null;
    }
    const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
    return {
      x: rect.left,
      y: rect.top + pageYScroll,
      w: rect.width
    };
  }

  handleClickThumbnail(index) {
    return (e) => {
      if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      e.preventDefault();
      this.setState({
        isLightboxOpen: true,
        lightboxIndex: index
      });
    };
  }

  onLightboxOpened = () => {
    Mousetrap.bind(prevHotKeys, () => this.photoSwipe.prev());
    Mousetrap.bind(nextHotKeys, () => this.photoSwipe.next());
  }

  onLightboxClosed = () => {
    this.setState({isLightboxOpen: false});
    Mousetrap.unbind(prevHotKeys);
    Mousetrap.unbind(nextHotKeys);
  }

  // react-photoswipe passes 'this' as a first argument unlike the PhotoSwipe API
  getLightboxData = (_, index, item) => {
    if (item.w === 0) {
      const rect = item.thumb.getBoundingClientRect();
      item.w = 800;
      item.h = rect.height * item.w / rect.width;
    }
    if (!item.msrc) {
      item.msrc = item.thumb.currentSrc;
    }
  }

  componentDidMount() {
    const thumbs = this.container.querySelectorAll('.attachment img');
    this.lightboxItems.forEach((_, i) => this.lightboxItems[i].thumb = thumbs[i]);

    if (!this.props.isSinglePost) {
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    }
  }

  componentWillUnmount() {
    if (!this.props.isSinglePost) {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  render() {
    const className = classnames({
      'image-attachments': true,
      'is-folded': this.state.isFolded,
      'needs-folding': this.state.needsFolding,
      'single-image': this.props.attachments.length === 1
    });

    const showFolded = (this.state.needsFolding && this.state.isFolded);
    let lastVisibleIndex = 0;
    if (showFolded) {
      let width = 0;
      this.itemWidths.forEach((w, i) => {
        width += w;
        if (width + arrowSize < this.state.containerWidth) {
          lastVisibleIndex = i;
        }
      });
    }

    return (
      <div className={className} ref={(el) => this.container = el}>
        {this.props.attachments.map((a, i) => (
            <ImageAttachment
              key={a.id}
              isEditing={this.props.isEditing}
              handleClick={this.handleClickThumbnail(i)}
              removeAttachment={this.props.removeAttachment}
              isHidden={showFolded && i > lastVisibleIndex}
              {...a} />
        ))}
        <div className="show-more">
          <i
            className="fa fa-2x fa-chevron-circle-right"
            onClick={this.toggleFolding}
            title={this.state.isFolded ? `Show more (${this.props.attachments.length - lastVisibleIndex - 1})` : "Show less"}/>
        </div>
        <PhotoSwipe
          ref={(el) => this.photoSwipe = el ? el.photoSwipe : null}
          items={this.lightboxItems}
          gettingData={this.getLightboxData}
          options={{...this.lightboxOptions, index: this.state.lightboxIndex}}
          isOpen={this.state.isLightboxOpen}
          onClose={this.onLightboxClosed}
          initialZoomInEnd={this.onLightboxOpened}/>
      </div>
    );
  }
}
