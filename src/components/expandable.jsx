import React from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";

export default class Expandable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      maxHeight: 100,
    };
    this.expand = this.expand.bind(this);
  }

  componentDidMount() {
    const {lineHeight, breakHeight, maxLines} = this.props;
    const content = ReactDOM.findDOMNode(this).querySelectorAll(".Linkify")[0];
    const maxHeight = getFoldedHeight(content, lineHeight, breakHeight, maxLines);
    const contentLines = getContentLines(content, lineHeight, breakHeight);
    this.setState({maxHeight});
    if (contentLines <= maxLines) {
      this.expand();
    }
  }

  render() {
    const expanded = this.state.expanded || this.props.expanded;
    const cn = classnames(["expandable", {expanded: expanded, folded: !expanded}]);
    const style = {maxHeight: expanded ? "300vh" : this.state.maxHeight+(this.props.headerHeight || 0)};
    return (<div className={cn} style={style}>
              {this.props.children}
              {!expanded && <div className="expand-panel" onClick={this.expand}>
              <div className="expand-button"><i>Read more</i> {this.props.bonusInfo}</div>
              </div>}
            </div>);
  }

  expand() {
    this.setState({expanded: true});
  }
}

function getFoldedHeight(content, lineHeight, breakHeight, maxLines) {
  const contentTop = content.getBoundingClientRect().top;
  const plainMaxHeight = lineHeight * maxLines;
  const paragraphBreaks = [...content.querySelectorAll(".p-break")];

  const paragraphBreaksBeforeFold = paragraphBreaks.reduce((res, div, i) => {
    const foldBottom = contentTop + plainMaxHeight + i*breakHeight;
    const breakBottom = div.getBoundingClientRect().bottom;
    if (breakBottom < foldBottom) {
      res+=1;
    }
    return res;
  }, 0);

  return lineHeight * maxLines + paragraphBreaksBeforeFold * breakHeight;
}

function getContentLines(content, lineHeight, breakHeight) {
  const paragraphBreaks = content.querySelectorAll(".p-break");
  const fullTextOnlyHeight = content.getBoundingClientRect().height - paragraphBreaks.length * breakHeight;
  return Math.floor(fullTextOnlyHeight/lineHeight);
}
