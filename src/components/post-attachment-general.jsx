import React from 'react';
import numeral from 'numeral';


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
          <i className="fa fa-file-o" />
          <span>{nameAndSize}</span>
        </a>

        {props.isEditing ? (
          <i className="remove-attachment fa fa-times" title="Remove file" onClick={this.handleClickOnRemoveAttachment} />
        ) : false}
      </div>
    );
  }
}

export default GeneralAttachment;
