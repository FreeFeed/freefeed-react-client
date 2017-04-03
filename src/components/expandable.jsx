import React from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";

const DEFAULT_MAX_LINES = 8;
const DEFAULT_ABOVE_FOLD_LINES = 5;

export default class Expandable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      maxHeight: 5000,
    };
    this.expand = this.expand.bind(this);
    this.rewrap = this.rewrap.bind(this);
  }

  componentDidMount() {
    this.rewrap();
    window.addEventListener("resize", this.rewrap);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.rewrap);
  }

  render() {
    const expanded = this.state.expanded || this.props.expanded;
    const cn = classnames(["expandable", {expanded: expanded, folded: !expanded}]);
    const style = {maxHeight: expanded ? "300vh" : `${this.state.maxHeight}px`};
    return (<div className={cn} style={style}>
              {this.props.children}
              {!expanded && <div className="expand-panel">
              <div className="expand-button"><i onClick={this.expand}>↪ Read more</i> {this.props.bonusInfo}</div>
              </div>}
            </div>);
  }

  expand() {
    this.setState({expanded: true});
  }

  rewrap() {
    const {maxLines, aboveFoldLines} = this.props;
    const lines = gatherContentLines(ReactDOM.findDOMNode(this), ".Linkify", ".p-break");
    const maxHeight = lines.length <= (maxLines || DEFAULT_MAX_LINES) ? "5000": lines[(aboveFoldLines || maxLines || DEFAULT_ABOVE_FOLD_LINES)].bottom;
    this.setState({maxHeight});
    if (lines.length <= (maxLines || DEFAULT_MAX_LINES)) {
      this.expand();
    }
  }
}

function gatherContentLines(node, contentSelector, breakSelector) {

  const content = node.querySelectorAll(contentSelector || ".wrapper")[0];
  const breaks = [...content.querySelectorAll(breakSelector || ".text")];
  const rects = [...content.getClientRects()];
  const breakRects = breaks.map(br => br.getBoundingClientRect());
  const breakTops = breakRects.map(br => br.top);

  const lines = rects.filter(rect => {
    const isRectABreak = breakTops.indexOf(rect.top) !== -1;
    return !isRectABreak;
  });

  const lineRects = lines.reduce((res, {top, bottom, left, right}) => {
    if (res.length === 0) {
      res.push({top, bottom, left, right});
    } else
    if (res[res.length - 1].top !== top) {
      res.push({top, bottom, left, right});
    } else {
      const last = res[res.length - 1];
      res[res.length - 1].bottom = last.bottom > bottom ? last.bottom : bottom;
      res[res.length - 1].left = last.left < left ? last.left : left;
      res[res.length - 1].right = last.right > right ? last.right : right;
    }
    return res;
  }, []);

  const nodeClientRect = node.getBoundingClientRect();

  return lineRects.map(({top, bottom, left, right}) => {
    return {
      top: top - nodeClientRect.top,
      bottom: bottom - nodeClientRect.top,
      left: left - nodeClientRect.left,
      right: nodeClientRect.right - right,
    };
  });
}
