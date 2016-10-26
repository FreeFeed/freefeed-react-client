import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import {PhotoSwipe} from 'react-photoswipe';
import ImageAttachment from './post-attachment-image';

const bordersSize = 4;
const spaceSize = 8;
const arrowSize = 24;

export default class PostAttachmentsImage extends React.Component {
  constructor(props) {
    super(props);

    this.itemWidths = props.attachments.map(({imageSizes: {t, o}}) => t ? t.w : (o ? o.w : 0)).map(w => w + bordersSize + spaceSize);
    this.contentWidth = this.itemWidths.reduce((s, w) => s + w, 0);

    this.state = {
      containerWidth: 0,
      isFolded: true,
      needsFolding: false,
      isLightboxOpen: false,
      lightboxIndex: 0
    };
  }

  lightboxOptions = {
    shareEl: false,
    clickToCloseNonZoomable: false,
    bgOpacity: 0.8,
    history: false,
    getThumbBoundsFn: this.getThumbBounds()
  };
  lightboxThumbnailElement = null;

  handleResize = () => {
    if (this.props.attachments.length == 1) {
      return;
    }
    const containerWidth = ReactDOM.findDOMNode(this).scrollWidth;
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

  getThumbBounds() {
    return (index) => {
      // If closing lightbox not on the same image we opened it
      if (index !== this.state.lightboxIndex) {
        return null;
      }

      const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
      const rect = this.lightboxThumbnailElement.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top + pageYScroll,
        w: rect.width
      };
    };
  }

  handleClickThumbnail(index) {
    return (e) => {
      if (e.button !== 0) {
        return;
      }
      e.preventDefault();
      this.lightboxThumbnailElement = e.target;
      this.setState({
        isLightboxOpen: true,
        lightboxIndex: index
      });
    };
  }

  handleCloseLightbox() {
    this.setState({isLightboxOpen: false});
  }

  getLightboxItems() {
    return this.props.attachments.map((attachment, i) => ({
      src: attachment.url,
      msrc: (i === this.state.lightboxIndex && this.lightboxThumbnailElement ? this.lightboxThumbnailElement.currentSrc : null),
      w: attachment.imageSizes && attachment.imageSizes.o && attachment.imageSizes.o.w || 0,
      h: attachment.imageSizes && attachment.imageSizes.o && attachment.imageSizes.o.h || 0
    }));
  }

  getLightboxData = ({items}, index) => {
    const item = items[index];
    if (item.w === 0) {
      const rect = this.lightboxThumbnailElement.getBoundingClientRect();
      item.w = 800;
      item.h = rect.height * item.w / rect.width;
    }
  }

  componentDidMount() {
    if (this.props.isSinglePost) {
      return;
    }
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    if (this.props.isSinglePost) {
      return;
    }
    window.removeEventListener('resize', this.handleResize);
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

    const lightboxItems = this.getLightboxItems();

    return (
      <div className={className} ref="cont">
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
          items={lightboxItems}
          gettingData={this.getLightboxData}
          options={{...this.lightboxOptions, index: this.state.lightboxIndex}}
          isOpen={this.state.isLightboxOpen}
          onClose={this.handleCloseLightbox.bind(this)}/>
      </div>
    );
  }
}
