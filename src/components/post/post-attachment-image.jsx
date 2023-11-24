import { PureComponent } from 'react';
import classnames from 'classnames';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { formatFileSize } from '../../utils';
import { Icon } from '../fontawesome-icons';

class PostAttachmentImage extends PureComponent {
  handleRemoveImage = () => {
    this.props.removeAttachment(this.props.id);
  };

  render() {
    const { props } = this;

    const formattedFileSize = formatFileSize(props.fileSize);
    const formattedImageSize = props.imageSizes.o
      ? `, ${props.imageSizes.o.w}×${props.imageSizes.o.h}px`
      : '';
    const nameAndSize = `${props.fileName} (${formattedFileSize}${formattedImageSize})`;
    const alt = `Image attachment ${props.fileName}`;

    let srcSet;
    if (props.imageSizes.t2 && props.imageSizes.t2.url) {
      srcSet = `${props.imageSizes.t2.url} 2x`;
    } else if (
      props.imageSizes.o &&
      props.imageSizes.t &&
      props.imageSizes.o.w <= props.imageSizes.t.w * 2
    ) {
      srcSet = `${props.imageSizes.o.url || props.url} 2x`;
    }

    const imageAttributes = {
      src: (props.imageSizes.t && props.imageSizes.t.url) || props.thumbnailUrl,
      srcSet,
      alt,
      loading: 'lazy',
      width: props.imageSizes.t
        ? props.imageSizes.t.w
        : props.imageSizes.o
          ? props.imageSizes.o.w
          : undefined,
      height: props.imageSizes.t
        ? props.imageSizes.t.h
        : props.imageSizes.o
          ? props.imageSizes.o.h
          : undefined,
    };

    return (
      <div
        className={classnames({ attachment: true, hidden: props.isHidden })}
        data-id={props.id}
        role="figure"
      >
        <a
          href={props.url}
          title={nameAndSize}
          onClick={props.handleClick}
          target="_blank"
          className="image-attachment-link"
        >
          {props.thumbnailUrl ? (
            <img className="image-attachment-img" {...imageAttributes} />
          ) : (
            props.id
          )}
        </a>

        {props.isEditing && (
          <Icon
            icon={faTimes}
            className="remove-attachment"
            title="Remove image"
            onClick={this.handleRemoveImage}
          />
        )}
      </div>
    );
  }
}

export default PostAttachmentImage;
