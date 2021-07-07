import { PureComponent } from 'react';
import { faFileVideo, faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { formatFileSize } from '../utils';
import { ButtonLink } from './button-link';
import { Icon } from './fontawesome-icons';

class VideoAttachment extends PureComponent {
  state = {
    isOpen: false,
  };

  handleClickOnRemoveAttachment = () => {
    this.props.removeAttachment(this.props.id);
  };

  toggleOpen = () => {
    this.setState({ isOpen: true });
  };

  render() {
    const { props } = this;
    const { isOpen } = this.state;
    const formattedFileSize = formatFileSize(props.fileSize);

    const title = `${props.fileName} (${formattedFileSize})`;

    return (
      <div className="attachment" role="figure" aria-label={`Video attachment ${title}`}>
        {isOpen ? (
          <div>
            <video title={title} autoPlay controls>
              <source src={props.url} />
              Your browser does not support HTML5 video tag.
            </video>
          </div>
        ) : (
          <ButtonLink
            onClick={this.toggleOpen}
            className="video-attachment-click-to-play"
            title="Click to play video"
          >
            <Icon icon={faPlayCircle} />
          </ButtonLink>
        )}
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
