import React from 'react';
import numeral from 'numeral';

export default (props) => {
  const formattedFileSize = numeral(props.fileSize).format('0.[0] b');
  const nameAndSize = `${props.fileName} (${formattedFileSize})`;

  const removeAttachment = () => props.removeAttachment(props.id);

  return (
    <div className="attachment">
      <a href={props.url} title={nameAndSize} target="_blank">
        <i className="fa fa-file-o" />
        <span>{nameAndSize}</span>
      </a>

      {props.isEditing ? (
        <i className="remove-attachment fa fa-times" title="Remove file" onClick={removeAttachment} />
      ) : false}
    </div>
  );
};
