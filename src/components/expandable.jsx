import { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './fontawesome-icons';

import ErrorBoundary from './error-boundary';

const DEFAULT_MAX_LINES = 8;
const DEFAULT_ABOVE_FOLD_LINES = 5;
const DEFAULT_KEY = 'default';

export default class Expandable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      userExpanded: false,
      maxHeight: 5000,
    };
    this.userExpand = this.userExpand.bind(this);
    this.rewrap = this.rewrap.bind(this);
  }

  componentDidMount() {
    this.rewrap();
    window.addEventListener('resize', this.rewrap);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.rewrap);
  }

  render() {
    const expanded = this.state.expanded || this.state.userExpanded || this.props.expanded;
    const cn = classnames(['expandable', { expanded, folded: !expanded }]);
    const style = { maxHeight: expanded ? '' : `${this.state.maxHeight}px` };
    return (
      <div className={cn} style={style}>
        <ErrorBoundary>
          {this.props.children}
          {!expanded && (
            <div className="expand-panel">
              <div className="expand-button">
                <i onClick={this.userExpand} role="button" aria-hidden>
                  <Icon icon={faChevronDown} className="expand-icon" /> Read more
                </i>{' '}
                {this.props.bonusInfo}
              </div>
            </div>
          )}
        </ErrorBoundary>
      </div>
    );
  }

  userExpand() {
    this.setState({ userExpanded: true });
  }

  rewrap() {
    const { maxLines, aboveFoldLines } = chooseLineCounts(this.props.config, window.innerWidth);
    const node = ReactDOM.findDOMNode(this);
    const lines = gatherContentLines(node, '.Linkify', '.p-break');
    const shouldExpand = lines.length <= (maxLines || DEFAULT_MAX_LINES);
    const [readMorePanel] = node.querySelectorAll('.expand-panel');
    const readMorePanelHeight = readMorePanel ? readMorePanel.clientHeight : 0;
    const foldedLines = aboveFoldLines || maxLines || DEFAULT_ABOVE_FOLD_LINES;
    const maxHeight = shouldExpand ? '5000' : lines[foldedLines - 1].bottom + readMorePanelHeight;
    this.setState({ expanded: shouldExpand, maxHeight });
  }
}

function gatherContentLines(node, contentSelector, breakSelector) {
  const [content] = node.querySelectorAll(contentSelector || '.wrapper');
  if (!content) {
    return [];
  }
  const breaks = [...content.querySelectorAll(breakSelector || '.text')];
  const rects = [...content.getClientRects()];
  const breakRects = breaks.map((br) => br.getBoundingClientRect());
  const breakTops = new Set(breakRects.map((br) => br.top));

  const lines = rects.filter((rect) => {
    const isRectABreak = breakTops.has(rect.top);
    return !isRectABreak;
  });

  const lineRects = lines.reduce((res, { top, bottom, left, right }) => {
    if (res.length === 0) {
      res.push({ top, bottom, left, right });
    } else if (res[res.length - 1].top !== top) {
      res.push({ top, bottom, left, right });
    } else {
      const last = res[res.length - 1];
      res[res.length - 1].bottom = last.bottom > bottom ? last.bottom : bottom;
      res[res.length - 1].left = last.left < left ? last.left : left;
      res[res.length - 1].right = last.right > right ? last.right : right;
    }
    return res;
  }, []);

  const nodeClientRect = node.getBoundingClientRect();

  return lineRects.map(({ top, bottom, left, right }) => {
    return {
      top: top - nodeClientRect.top,
      bottom: bottom - nodeClientRect.top,
      left: left - nodeClientRect.left,
      right: nodeClientRect.right - right,
    };
  });
}

function chooseLineCounts(config = {}, windowWidth) {
  const breakpoints = Object.keys(config)
    .filter((key) => key !== DEFAULT_KEY)
    .map(Number)
    .sort((a, b) => a - b);
  const breakpointToUse = breakpoints.find((b) => b >= windowWidth) || DEFAULT_KEY;
  return (
    config[breakpointToUse] || {
      maxLines: DEFAULT_MAX_LINES,
      aboveFoldLines: DEFAULT_ABOVE_FOLD_LINES,
    }
  );
}
