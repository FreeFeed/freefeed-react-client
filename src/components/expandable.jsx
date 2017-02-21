import React from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";

export default class Expandable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
    this.expand = this.expand.bind(this);
  }

  componentDidMount() {
    const headerHeight = this.props.headerHeight || 0;
    const div = ReactDOM.findDOMNode(this);
    const scrollHeight = div.scrollHeight - headerHeight;
    if (scrollHeight/this.props.lineHeight <= this.props.maxLines) {
      this.expand();
    }
  }

  render() {
    const expanded = this.state.expanded || this.props.expanded;
    const cn = classnames(["expandable", {expanded: expanded, folded: !expanded}]);
    const style = {maxHeight: expanded ? "300vh" : this.props.maxHeight+(this.props.headerHeight || 0) || "100px"};
    return (<div className={cn} style={style}>
              {this.props.children}
              {!expanded && <div className="expand-panel" onClick={this.expand}>
              <div className="expand-button">Read more {this.props.bonusInfo}</div>
              </div>}
            </div>);
  }

  expand() {
    this.setState({expanded: true});
  }
}

