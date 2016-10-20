import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import ImageAttachment from './post-attachment-image';

const bordersSize = 4;
const spaceSize = 8;
const arrowSize = 24;

export default class PostAttachmentsImage extends React.Component {
  constructor(props) {
    super(props);

    this.itemWidths = props.attachments.map(({imageSizes: {t, o}}) => t ? t.w : (o ? o.w : 0)).map(w => w + bordersSize + spaceSize);
    this.contentWidth = this.itemWidths.reduce((s, w) => s + w, 0);

    this.state = {
      containerWidth: 0,
      isFolded: true,
      needsFolding: false
    };
  }

  handleResize = () => {
    const containerWidth = ReactDOM.findDOMNode(this).scrollWidth;
    if (containerWidth !== this.state.containerWidth) {
      this.setState({
        containerWidth,
        needsFolding: containerWidth < this.contentWidth
      });
    }
  }

  toggleFolding = () => {
    this.setState({isFolded: !this.state.isFolded});
  }

  componentDidMount() {
    if (this.props.isSinglePost) {
      return;
    }
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    if (this.props.isSinglePost) {
      return;
    }
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const className = classnames({
      'image-attachments': true,
      'is-folded': this.state.isFolded,
      'needs-folding': this.state.needsFolding,
      'single-image': this.props.attachments.length === 1
    });

    const showFolded = (this.state.needsFolding && this.state.isFolded);
    let lastVisibleIndex = 0;
    if (showFolded) {
      let width = 0;
      this.itemWidths.forEach((w, i) => {
        width += w;
        if (width + arrowSize < this.state.containerWidth) {
          lastVisibleIndex = i;
        }
      });
    }

    return (
      <div className={className} ref="cont">
        {this.props.attachments.map((a, i) => (
            <ImageAttachment
              key={a.id}
              isEditing={this.props.isEditing}
              removeAttachment={this.props.removeAttachment}
              isHidden={showFolded && i > lastVisibleIndex}
              {...a} />
        ))}
        <div className="show-more">
          <i
            className="fa fa-2x fa-chevron-circle-right"
            onClick={this.toggleFolding}
            title={this.state.isFolded ? `Show more (${this.props.attachments.length - lastVisibleIndex - 1})` : "Show less"}/>
        </div>
      </div>
    );
  }
}
