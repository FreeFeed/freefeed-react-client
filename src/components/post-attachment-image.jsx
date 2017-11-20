import React from 'react';
import classnames from 'classnames';
import numeral from 'numeral';

export default (props) => {
  const formattedFileSize = numeral(props.fileSize).format('0.[0] b');
  const formattedImageSize = (props.imageSizes.o ? `, ${props.imageSizes.o.w}×${props.imageSizes.o.h}px` : '');
  const nameAndSize = `${props.fileName} (${formattedFileSize}${formattedImageSize})`;

  const removeAttachment = () => props.removeAttachment(props.id);

  let srcSet;
  if (props.imageSizes.t2 && props.imageSizes.t2.url) {
    srcSet = `${props.imageSizes.t2.url} 2x`;
  } else if (props.imageSizes.o && props.imageSizes.t && props.imageSizes.o.w <= props.imageSizes.t.w * 2) {
    srcSet = `${props.imageSizes.o.url || props.url} 2x`;
  }

  const imageAttributes = {
    src: props.imageSizes.t && props.imageSizes.t.url || props.thumbnailUrl,
    srcSet,
    alt: nameAndSize,
    width: props.imageSizes.t ? props.imageSizes.t.w : (props.imageSizes.o ? props.imageSizes.o.w : undefined),
    height: props.imageSizes.t ? props.imageSizes.t.h : (props.imageSizes.o ? props.imageSizes.o.h : undefined)
  };

  return (
    <div className={classnames({attachment: true, hidden: props.isHidden})}>
      <a href={props.url} title={nameAndSize} onClick={props.handleClick} target="_blank" className="image-attachment-link">
        {props.thumbnailUrl ? (
          <img className="image-attachment-img" {...imageAttributes}/>
        ) : (
          props.id
        )}
      </a>

      {props.isEditing ? (
        <a className="remove-attachment fa fa-times" title="Remove image" onClick={removeAttachment}></a>
      ) : false}
    </div>
  );
};
