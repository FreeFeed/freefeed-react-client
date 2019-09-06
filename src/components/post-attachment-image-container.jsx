import pt from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import Loadable from 'react-loadable';

import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import ImageAttachment from './post-attachment-image';
import { Icon } from './fontawesome-icons';


const bordersSize = 4;
const spaceSize = 8;
const arrowSize = 24;

const ImageAttachmentsLightbox = Loadable({
  loading: ({ error, pastDelay }) => {
    if (error) {
      console.error(`Cannot load 'post-attachment-image-lightbox'`, error);  // eslint-disable-line no-console
      return <div style={{ color: 'red' }}>Cannot load lightbox. Please try again.</div>;
    }
    if (pastDelay) {
      return <div className="lightbox-loading"><span>Loading lightbox...</span></div>;
    }
    return null;
  },
  loader:  () => import('./post-attachment-image-lightbox'),
  delay:   500,
  timeout: 10000,
});

const Sortable = Loadable({
  loading: ({ error }) => {
    if (error) {
      return <div>Cannot load Sortable component</div>;
    }
    return <div>Loading component...</div>;
  },
  loader: () => import('react-sortablejs'),
  delay:  500,
});

export default class ImageAttachmentsContainer extends React.Component {
  static propTypes = {
    attachments:             pt.array.isRequired,
    isSinglePost:            pt.bool,
    isEditing:               pt.bool,
    removeAttachment:        pt.func,
    reorderImageAttachments: pt.func,
    postId:                  pt.string,
  };

  state = {
    containerWidth: 0,
    isFolded:       true,
    needsFolding:   false,
    lightboxIndex:  -1, // lightbox is hidden if lightboxIndex < 0
  };

  container = null;

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
      this.setState({ lightboxIndex: index });
    };
  }

  onLightboxDestroy = () => this.setState({ lightboxIndex: -1 });

  getLightboxItems() {
    return this.props.attachments.map((a) => ({
      src: a.url,
      w:   (a.imageSizes && a.imageSizes.o && a.imageSizes.o.w) || 0,
      h:   (a.imageSizes && a.imageSizes.o && a.imageSizes.o.h) || 0,
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

  onSortChange = (order) => this.props.reorderImageAttachments(order);

  render() {
    const isSingleImage = this.props.attachments.length === 1;
    const withSortable = this.props.isEditing && this.props.attachments.length > 1;
    const className = classnames({
      'image-attachments': true,
      'is-folded':         this.state.isFolded,
      'needs-folding':     this.state.needsFolding,
      'single-image':      isSingleImage,
      'sortable-images':   withSortable,
    });

    const showFolded = (this.state.needsFolding && this.state.isFolded && !this.props.isEditing);
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

    const allImages = this.props.attachments.map((a, i) => (
      <ImageAttachment
        key={a.id}
        isEditing={this.props.isEditing}
        handleClick={this.handleClickThumbnail(i)}
        removeAttachment={this.props.removeAttachment}
        isHidden={showFolded && i > lastVisibleIndex}
        {...a}
      />
    ));

    return (
      <div className={className} ref={this.registerContainer}>
        {withSortable ?
          <Sortable onChange={this.onSortChange} >{allImages}</Sortable>
          : allImages}
        {(isSingleImage || this.props.isEditing) ? false : (
          <div className="show-more">
            <Icon
              icon={faChevronCircleRight} className="show-more-icon"
              onClick={this.toggleFolding}
              title={this.state.isFolded ? `Show more (${this.props.attachments.length - lastVisibleIndex - 1})` : "Show less"}
            />
          </div>
        )}
        {this.state.lightboxIndex >= 0 ? (
          <ImageAttachmentsLightbox
            items={this.getLightboxItems()}
            index={this.state.lightboxIndex}
            postId={this.props.postId}
            getThumbnail={this.getThumbnail}
            onDestroy={this.onLightboxDestroy}
          />
        ) : false}
      </div>
    );
  }
}
