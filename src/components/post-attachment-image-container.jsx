import React, { PropTypes as pt } from 'react';
import classnames from 'classnames';
import ImageAttachment from './post-attachment-image';
import ImageAttachmentsLightbox from './post-attachment-image-lightbox';

const bordersSize = 4;
const spaceSize = 8;
const arrowSize = 24;

export default class ImageAttachmentsContainer extends React.Component {
  static propTypes = {
    attachments: pt.array.isRequired,
    isSinglePost: pt.bool,
    isEditing: pt.bool,
    removeAttachment: pt.func,
    postId: pt.string,
  };

  state = {
    containerWidth: 0,
    isFolded: true,
    needsFolding: false,
  };

  container = null;
  lightbox = null;

  getItemWidths() {
    return this.props.attachments.map(({ imageSizes: { t, o } }) => t ? t.w : (o ? o.w : 0)).map((w) => w + bordersSize + spaceSize);
  }

  getContentWidth() {
    return this.getItemWidths().reduce((s, w) => s + w, 0);
  }

  handleResize = () => {
    const containerWidth = this.container.scrollWidth;
    if (containerWidth !== this.state.containerWidth) {
      this.setState({
        containerWidth,
        needsFolding: containerWidth < this.getContentWidth()
      });
    }
  };

  toggleFolding = () => {
    this.setState({ isFolded: !this.state.isFolded });
  };

  handleClickThumbnail(index) {
    return (e) => {
      if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      e.preventDefault();
      this.lightbox.open(index);
    };
  }

  getLightboxItems() {
    return this.props.attachments.map((a) => ({
      src: a.url,
      w: a.imageSizes && a.imageSizes.o && a.imageSizes.o.w || 0,
      h: a.imageSizes && a.imageSizes.o && a.imageSizes.o.h || 0,
      pid: a.id.substr(0, 8),
    }));
  }

  getThumbnail = (index) => {
    if (index >= 0 && this.container) {
      const thumbs = this.container.querySelectorAll('.attachment img');
      if (index < thumbs.length) {
        return thumbs[index];
      }
    }
    return null;
  };

  componentDidMount() {
    if (!this.props.isSinglePost && this.props.attachments.length > 1) {
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    }
  }

  componentWillUnmount() {
    if (!this.props.isSinglePost && this.props.attachments.length > 1) {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  registerContainer = (el) => {
    this.container = el;
  };

  registerLightbox = (el) => {
    this.lightbox = el;
  };

  render() {
    const isSingleImage = this.props.attachments.length === 1;
    const className = classnames({
      'image-attachments': true,
      'is-folded': this.state.isFolded,
      'needs-folding': this.state.needsFolding,
      'single-image': isSingleImage
    });

    const showFolded = (this.state.needsFolding && this.state.isFolded);
    let lastVisibleIndex = 0;
    if (showFolded) {
      let width = 0;
      this.getItemWidths().forEach((w, i) => {
        width += w;
        if (width + arrowSize < this.state.containerWidth) {
          lastVisibleIndex = i;
        }
      });
    }

    return (
      <div className={className} ref={this.registerContainer}>
        {this.props.attachments.map((a, i) => (
          <ImageAttachment
            key={a.id}
            isEditing={this.props.isEditing}
            handleClick={this.handleClickThumbnail(i)}
            removeAttachment={this.props.removeAttachment}
            isHidden={showFolded && i > lastVisibleIndex}
            {...a}
          />
        ))}
        {isSingleImage ? false : (
          <div className="show-more">
            <i
              className="fa fa-2x fa-chevron-circle-right"
              onClick={this.toggleFolding}
              title={this.state.isFolded ? `Show more (${this.props.attachments.length - lastVisibleIndex - 1})` : "Show less"}
            />
          </div>
        )}
        <ImageAttachmentsLightbox
          ref={this.registerLightbox}
          items={this.getLightboxItems()}
          postId={this.props.postId}
          getThumbnail={this.getThumbnail}
        />
      </div>
    );
  }
}
