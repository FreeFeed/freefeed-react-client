import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import UserName from './user-name';

// props types
const userType = PropTypes.shape({
  id:       PropTypes.string,
  username: PropTypes.string
});

const commentType = PropTypes.shape({ user: userType });

export default class PostVia extends React.Component {
  static propTypes = {
    post: PropTypes.shape({
      createdBy:      userType,
      recipients:     PropTypes.arrayOf(userType),
      comments:       PropTypes.arrayOf(commentType),
      usersLikedPost: PropTypes.arrayOf(userType)
    }).isRequired,

    me: PropTypes.shape({
      id:            PropTypes.string,
      subscriptions: PropTypes.arrayOf(PropTypes.string)
    }).isRequired
  };

  constructor(props) {
    super(props);
    this.state = { expanded: false };
  }

  expand = () => this.setState({ expanded: true });

  render() {
    const {
      post: {
        createdBy,
        recipients,
        comments,
        usersLikedPost
      },
      me: {
        id: myId,
        subscriptions
      }
    } = this.props;

    const isMe = ({ id }) => myId === id;
    const inSubscriptions = ({ id }) => myId === id || (subscriptions && subscriptions.some((s) => s == id));

    if (inSubscriptions(createdBy) || recipients.some(inSubscriptions)) {
      return false;
    }

    const inComments = comments.map(_.property('user')).filter(inSubscriptions);
    const inLikes = usersLikedPost.filter(inSubscriptions);

    let textPrefix = false;
    if (inComments.length === 0 && inLikes.length === 0) {
      textPrefix = 'somebody';
    } else if (inComments.some(isMe)) {
      textPrefix = 'your comment';
    } else if (inLikes.some(isMe)) {
      textPrefix = 'your like';
    }

    const users = _.unionBy(inComments, inLikes, _.property('id')).filter((u) => !isMe(u));
    const cutAt = textPrefix ? 2 : 3;
    const foldedCount = (!this.state.expanded && users.length > cutAt + 1) ? users.length - cutAt : 0;

    if (foldedCount) {
      users.length -= foldedCount;
    }

    return (
      <span className="post-via-sources">
        via {textPrefix}
        {users.map((u, i) => (
          <span key={`via-${u.username}`}>
            {(i || textPrefix) ? ((!foldedCount && i === users.length - 1) ? ' and ' : ', ') : false}
            <UserName user={u} />
          </span>
        ))}
        {foldedCount ? <span> and <a className="post-via-more" onClick={this.expand}>{foldedCount} more</a></span> : false}
      </span>
    );
  }
}
