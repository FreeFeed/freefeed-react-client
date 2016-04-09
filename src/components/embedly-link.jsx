import React from 'react';

let previewHeights = [];

const getNodeInfo = node => previewHeights.filter(info => info.node === node)[0];

const getPreviousHeight = node => {
  const nodeInfo = getNodeInfo(node);
  if (!nodeInfo) {
    previewHeights.push({
      node,
      height: 0
    });
    return 0;
  }
  return nodeInfo.height;
};

const setHeight = (node, height) => {
  const nodeInfo = getNodeInfo(node);
  if (!nodeInfo) {
    previewHeights.push({
      node,
      height,
    });
  } else {
    nodeInfo.height = height;
  }
};

const clearInfo = node => {
  const info = getNodeInfo(node);
  const infoIndex = previewHeights.indexOf(info);
  previewHeights = [...previewHeights.slice(0, infoIndex), ...previewHeights.slice(infoIndex+1)];
};

const compensator = node => {
  const previousHeight = getPreviousHeight(node);
  const currentHeight = node.offsetHeight;
  const top = node.getBoundingClientRect().top;
  if (top<=0) {
    scrollBy(0, currentHeight - previousHeight);
  }
  setHeight(node, currentHeight);
};

const getParentNode = node => node.parentNode;

embedly('on', 'card.resize', frame => compensator(getParentNode(getParentNode(frame))));

export default class EmbedlyLink extends React.Component {
  createLink(link) {
    this.refs.root.innerHTML = `<a
            href=${link}
            data-card-controls="0"
            data-card-width="60%"
            data-card-recommend="0"
            data-card-align="left"/>`;
    embedly('card', this.refs.root.children[0]);
  }
  componentDidMount() {
    this.createLink(this.props.link);
  }
  componentWillReceiveProps(newProps) {
    if (this.props.link !== newProps.link) {
      this.createLink(newProps.link);
    }
  }
  componentWillUnmount() {
    clearInfo(this.refs.root.children[0]);
  }
  render() {
    return (<div ref="root"/>);
  }
}