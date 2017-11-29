import React from 'react';
import numeral from 'numeral';

class AudioAttachment extends React.PureComponent {
  handleClickOnRemoveAttachment = () => {
    this.props.removeAttachment(this.props.id);
  };

  render() {
    const { props } = this;
    const formattedFileSize = numeral(props.fileSize).format('0.[0] b');

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
            <i className="fa fa-file-audio-o" />
            <span>{artistAndTitle}</span>
          </a>

          {props.isEditing ? (
            <i className="remove-attachment fa fa-times" title="Remove audio file" onClick={this.handleClickOnRemoveAttachment} />
          ) : false}
        </div>
      </div>
    );
  }
}

export default AudioAttachment;
