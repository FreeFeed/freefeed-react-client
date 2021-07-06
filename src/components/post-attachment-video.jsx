import { PureComponent } from 'react';
import { faFileVideo } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { formatFileSize } from '../utils';
import { Icon } from './fontawesome-icons';

class VideoAttachment extends PureComponent {
  handleClickOnRemoveAttachment = () => {
    this.props.removeAttachment(this.props.id);
  };

  render() {
    const { props } = this;
    const formattedFileSize = formatFileSize(props.fileSize);

    const title = `${props.fileName} (${formattedFileSize})`;

    return (
      <div className="attachment" role="figure" aria-label={`Video attachment ${title}`}>
        <div>
          <video title={title} preload="none" muted controls>
            <source src={props.url} />
            Your browser does not support HTML5 video tag.
          </video>
        </div>
        <div>
          <a href={props.url} title={title} target="_blank">
            <Icon icon={faFileVideo} className="attachment-icon" />
            <span>{title}</span>
          </a>

          {props.isEditing && (
            <Icon
              icon={faTimes}
              className="remove-attachment"
              title="Remove video file"
              onClick={this.handleClickOnRemoveAttachment}
            />
          )}
        </div>
      </div>
    );
  }
}

export default VideoAttachment;
