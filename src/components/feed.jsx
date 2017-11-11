import React, { Component } from 'react';
import scrollTo from '../utils/animated-scrollto';
import Post from './post';

const HiddenEntriesToggle = (props) => {
  const entriesForm = (props.count > 1 ? 'entries' : 'entry');
  let label;

  if (props.isOpen) {
    label = `\u25bc Don't show ${props.count} hidden ${entriesForm}`;
  } else {
    label = `\u25ba Show ${props.count} hidden ${entriesForm}`;
  }

  return (
    <div className="hidden-posts-toggle">
      <a onClick={props.toggle}>
        {label}
      </a>
    </div>
  );
};

export default class Feed extends Component {
  constructor(props) {
    super(props);
  }
  current = -1;
  handleKey = (e) => {
    const nodeName = e.target.nodeName;
    let node = this.postsDom.childNodes[this.current]; // current node
    const l = this.postsDom.childNodes.length; // posts length
    const keyCode = (window.event) ? e.which : e.keyCode;
    if (nodeName !== 'INPUT' && nodeName !== 'TEXTAREA') {
      if (keyCode === 74 || keyCode === 75) { // 74 -> j and 75 -> k
        if (keyCode === 74 && this.current < l - 1) {

          this.current++;

        } else if (keyCode === 75 && this.current > 0) {

          this.current--;

        }
        node = this.postsDom.childNodes[this.current];
        if (node) {

          scrollTo(node, 200);

        }
      }
    }
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKey, false);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKey, false);
  }
  getEntryComponent = section => post => {
    const isRecentlyHidden = (post.isHidden && (section === 'visible'));
    const props = this.props;
    return (
      <Post {...post}
        key={post.id}
        user={props.user}
        isInHomeFeed={props.isInHomeFeed}
        isInUserFeed={props.isInUserFeed}
        isRecentlyHidden={isRecentlyHidden}
        showMoreComments={props.showMoreComments}
        showMoreLikes={props.showMoreLikes}
        toggleEditingPost={props.toggleEditingPost}
        cancelEditingPost={props.cancelEditingPost}
        saveEditingPost={props.saveEditingPost}
        deletePost={props.deletePost}
        addAttachmentResponse={props.addAttachmentResponse}
        removeAttachment={props.removeAttachment}
        toggleCommenting={props.toggleCommenting}
        updateCommentingText={props.updateCommentingText}
        addComment={props.addComment}
        likePost={props.likePost}
        unlikePost={props.unlikePost}
        hidePost={props.hidePost}
        unhidePost={props.unhidePost}
        toggleModeratingComments={props.toggleModeratingComments}
        disableComments={props.disableComments}
        enableComments={props.enableComments}
        commentEdit={props.commentEdit}
        highlightTerms={props.highlightTerms} />
    );
  };
  render() {
    const props = this.props;
    const visibleEntries = props.visibleEntries.map(this.getEntryComponent('visible'));
    const hiddenEntries = (props.hiddenEntries || []).map(this.getEntryComponent('hidden'));
    return (
      <div className="posts" style={{ outline: 'none' }} ref={(c) => this.postsDom = c}>
        {visibleEntries}

        {hiddenEntries.length > 0 ? (
          <div>
            <HiddenEntriesToggle
              count={hiddenEntries.length}
              isOpen={props.isHiddenRevealed}
              toggle={props.toggleHiddenPosts} />

            {props.isHiddenRevealed ? hiddenEntries : false}
          </div>
        ) : false}
      </div>
    );
  }
}
