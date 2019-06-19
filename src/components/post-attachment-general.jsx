import React from 'react';
import numeral from 'numeral';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './fontawesome-icons';


class GeneralAttachment extends React.PureComponent {
  handleClickOnRemoveAttachment = () => {
    this.props.removeAttachment(this.props.id);
  };

  render() {
    const { props } = this;
    const formattedFileSize = numeral(props.fileSize).format('0.[0] ib');
    const nameAndSize = `${props.fileName} (${formattedFileSize})`;

    return (
      <div className="attachment">
        <a href={props.url} title={nameAndSize} target="_blank">
          <Icon icon={faFile} className="attachment-icon" />
          <span>{nameAndSize}</span>
        </a>

        {props.isEditing &&
          <Icon icon={faTimes} className="remove-attachment" title="Remove file" onClick={this.handleClickOnRemoveAttachment} />}
      </div>
    );
  }
}

export default GeneralAttachment;
