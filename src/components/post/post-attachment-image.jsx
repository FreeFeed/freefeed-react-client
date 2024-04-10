import { PureComponent, createRef } from 'react';
import classnames from 'classnames';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { formatFileSize } from '../../utils';
import { Icon } from '../fontawesome-icons';

const NSFW_PREVIEW_AREA = 20;

class PostAttachmentImage extends PureComponent {
  canvasRef = createRef(null);

  handleRemoveImage = () => {
    this.props.removeAttachment(this.props.id);
  };

  componentDidMount() {
    const nsfwCanvas = this.canvasRef.current;
    if (!nsfwCanvas) {
      return;
    }
    const ctx = nsfwCanvas.getContext('2d');
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, nsfwCanvas.width, nsfwCanvas.height);
    const img = new Image();
    img.onload = () =>
      nsfwCanvas.isConnected && ctx.drawImage(img, 0, 0, nsfwCanvas.width, nsfwCanvas.height);
    img.src = this.props.imageSizes.t?.url ?? this.props.thumbnailUrl;
  }

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
      id: props.pictureId,
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

    const area = imageAttributes.width * imageAttributes.height;
    const canvasWidth = Math.round(imageAttributes.width * Math.sqrt(NSFW_PREVIEW_AREA / area));
    const canvasHeight = Math.round(imageAttributes.height * Math.sqrt(NSFW_PREVIEW_AREA / area));

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
            <>
              {props.isNSFW && (
                <canvas
                  ref={this.canvasRef}
                  className="image-attachment-nsfw-canvas"
                  width={canvasWidth}
                  height={canvasHeight}
                />
              )}
              <img className="image-attachment-img" {...imageAttributes} />
            </>
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
