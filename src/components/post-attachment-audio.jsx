import React from 'react';
import { faFileAudio } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { formatFileSize } from '../utils';
import { Icon } from './fontawesome-icons';


class AudioAttachment extends React.PureComponent {
  handleClickOnRemoveAttachment = () => {
    this.props.removeAttachment(this.props.id);
  };

  render() {
    const { props } = this;
    const formattedFileSize = formatFileSize(props.fileSize);

    let artistAndTitle = '';
    if (props.title && props.artist) {
      artistAndTitle = `${props.artist} – ${props.title} (${formattedFileSize})`;
    } else if (props.title) {
      artistAndTitle = `${props.title} (${formattedFileSize})`;
    } else {
      artistAndTitle = `${props.fileName} (${formattedFileSize})`;
    }

    return (
      <div className="attachment">
        <div>
          <audio src={props.url} title={artistAndTitle} preload="none" controls />
        </div>
        <div>
          <a href={props.url} title={artistAndTitle} target="_blank">
            <Icon icon={faFileAudio} className="attachment-icon" />
            <span>{artistAndTitle}</span>
          </a>

          {props.isEditing &&
            <Icon icon={faTimes} className="remove-attachment" title="Remove audio file" onClick={this.handleClickOnRemoveAttachment} />}
        </div>
      </div>
    );
  }
}

export default AudioAttachment;
