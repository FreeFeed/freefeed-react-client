import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import Textarea from "react-textarea-autosize";
import throbber16 from "../../assets/images/throbber-16.gif";
import { preventDefault } from "../utils";
import { createFreefeedInvitation } from "../redux/action-creators";
import SendTo from "./send-to";

export const INVITATION_LANGUAGE_OPTIONS = {
  RUSSIAN: "ru",
  ENGLISH: "en",
};

class InvitationCreationForm extends React.Component {
  state = {
    message: "",
    suggestions: "",
    singleUse: false,
    lang: INVITATION_LANGUAGE_OPTIONS.RUSSIAN,
  };

  componentDidMount() {
    this.suggestedSubscriptionsChanged();
  }

  render() {
    const { authenticated } = this.props;
    if (!authenticated) {
      return (
        <div className="content">
          <div className="alert alert-danger" role="alert">You must <Link to="/signin">sign in</Link> or <Link to="/signup">sign up</Link> before visiting this page.</div>
        </div>
      );
    }
    const { userFeeds, groupFeeds, user, form, baseLocation } = this.props;
    return (
      <div className="box">
        <div className="box-header-timeline">
          Invite to Freefeed
        </div>
        <div className="box-body">
          <form onSubmit={preventDefault(this.createInvitation)}>
            <div>Suggested users</div>
            <SendTo
              ref={this.saveUsersSelectRef}
              alwaysShowSelect={true}
              feeds={userFeeds}
              defaultFeed={user && user.username}
              user={user}
              excludeMyFeed={true}
              disableAutoFocus={true}
              onChange={this.suggestedSubscriptionsChanged}
            />
            <div>Suggested groups</div>
            <SendTo
              ref={this.saveGroupsSelectRef}
              alwaysShowSelect={true}
              feeds={groupFeeds}
              user={user}
              excludeMyFeed={true}
              disableAutoFocus={true}
              onChange={this.suggestedSubscriptionsChanged}
            />
            <div>Invitation page language</div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  name="invitationLanguage"
                  value={INVITATION_LANGUAGE_OPTIONS.RUSSIAN}
                  checked={this.state.lang === INVITATION_LANGUAGE_OPTIONS.RUSSIAN}
                  onChange={this.changeInvitationLanguage}
                />
                Russian
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  name="invitationLanguage"
                  value={INVITATION_LANGUAGE_OPTIONS.ENGLISH}
                  checked={this.state.lang === INVITATION_LANGUAGE_OPTIONS.ENGLISH}
                  onChange={this.changeInvitationLanguage}
                />
                English
              </label>
            </div>

            <div className="checkbox">
              <label>
                <input type="checkbox" name="one-time" value="0" checked={this.state.singleUse} onChange={this.toggleOneTime} />
                One-time use invite
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="invite-message">Personal message</label>
              <Textarea
                id="invite-message"
                className="form-control"
                value={this.state.message}
                onChange={this.onInvitationTextChange}
                minRows={3}
                maxRows={10}
                maxLength="1500"
              />
            </div>
            <p>
              <button className="btn btn-default" type="submit">Create invitation</button>
              {form.isSaving &&
                <span className="settings-throbber">
                  <img width="16" height="16" src={throbber16} />
                </span>
              }
            </p>
            {form.success ? (
              <div className="alert alert-info" role="alert">
                Created invitation:&nbsp;
                <a href={`${baseLocation}/invited/${form.invitationId}`}>{`${baseLocation}/invited/${form.invitationId}`}</a>
              </div>
            ) : form.error ? (
              <div className="alert alert-danger" role="alert">{form.errorText}</div>
            ) : false}
          </form>
        </div>
        <div className="box-footer" />
      </div >);
  }

  onInvitationTextChange = ({ target }) => this.setState({ message: target.value });

  saveUsersSelectRef = (_u) => this.userFeedsSelector = _u;

  saveGroupsSelectRef = (_g) => this.groupFeedsSelector = _g;

  changeInvitationLanguage = ({ target }) => this.setState({ lang: target.value }, this.suggestedSubscriptionsChanged);

  toggleOneTime = ({ target }) => this.setState({ singleUse: target.checked });

  suggestedSubscriptionsChanged = () => {
    const usersSuggests = this.userFeedsSelector.values;
    const groupsSuggests = this.groupFeedsSelector.values;
    const descriptions = this.props.feedsDescriptions;
    const myUsername = this.props.user.username;
    const { lang } = this.state;
    const suggestions = formatSuggestionsText(usersSuggests, groupsSuggests, descriptions, myUsername, lang);
    const customMessage = this.state.message.replace(this.state.suggestions, "").trim();
    const message = `${customMessage}${(customMessage && suggestions) ? "\n\n" : ""}${suggestions || ""}`;
    this.setState({ message, suggestions });
  };

  createInvitation = () => {
    const { message, lang, singleUse } = this.state;
    const users = this.userFeedsSelector.values;
    const groups = this.groupFeedsSelector.values;
    this.props.createInvitation(message, lang, singleUse, users, groups);
  };
}

function mapStateToProps(state) {
  const { authenticated, user, createInvitationForm, users, groups } = state;
  const userFeeds = Object.keys(users).map((id) => ({ id, user: users[id] })).filter(({ user }) => user.type === "user");
  const groupFeeds = Object.keys(groups).map((id) => ({ id, user: groups[id] }));
  const feedsDescriptions = getFeedsDescriptions(users, groups);
  return {
    baseLocation: window.location.origin,
    authenticated,
    user,
    userFeeds,
    groupFeeds,
    feedsDescriptions,
    form: createInvitationForm,
  };
}

function getFeedsDescriptions(...feeds) {
  return feeds.reduce((result, feedList) => {
    return Object.keys(feedList).map((feedId) => feedList[feedId]).reduce((res, feed) => {
      res[feed.username] = feed.description;
      return res;
    }, result);
  }, {});
}

const SELF_DESCRIPTION = {
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: "это я",
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: "it's me",
};

const USER_PREFIXES = {
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: "Вот интересные пользователи:",
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: "Here are the users that I recommend you to follow:",
};

const GROUP_PREFIXES = {
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: "и группы:",
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: "And groups:",
};

const ONLY_GROUP_PREFIXES = {
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: "Вот интересные группы:",
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: "Here are the groups that I recommend you to follow:",
};

function formatSuggestionsText(users = [], groups = [], descriptions, myUsername, lang = INVITATION_LANGUAGE_OPTIONS.ENGLISH) {
  if (!users.length && !groups.length) {
    return "";
  }

  const patchedDescriptions = { ...descriptions, [myUsername]: `${SELF_DESCRIPTION[lang]} ${descriptions[myUsername] || ''}` };
  const usersSuggestion = users.map((suggest) => formatSuggest(suggest, patchedDescriptions[suggest])).join("\n");
  const groupsSuggestion = groups.map((suggest) => formatSuggest(suggest, patchedDescriptions[suggest])).join("\n");

  if (!users.length) {
    const onlyGroupsPrefix = ONLY_GROUP_PREFIXES[lang];
    return `${onlyGroupsPrefix}\n${groupsSuggestion}`;
  }

  const usersPrefix = USER_PREFIXES[lang];
  const groupsPrefix = GROUP_PREFIXES[lang];

  return groups.length
    ? `${usersPrefix}\n${usersSuggestion}\n\n${groupsPrefix}\n${groupsSuggestion}`
    : `${usersPrefix}\n${usersSuggestion}`;
}

function formatSuggest(suggest, description) {
  if (!description || !description.trim()) {
    return `@${suggest}`;
  }
  const trimmedDescription = description.trim();
  const firstNewlineIndex = trimmedDescription.indexOf("\n");
  const formattedDescription = firstNewlineIndex === -1 ? trimmedDescription : trimmedDescription.substring(0, firstNewlineIndex);
  return `@${suggest} — ${formattedDescription}`;
}

function mapDispatchToProps(dispatch) {
  return {
    createInvitation: (...args) => dispatch(createFreefeedInvitation(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InvitationCreationForm);
