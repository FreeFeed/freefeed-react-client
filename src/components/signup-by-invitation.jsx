import React from "react";
import { connect } from "react-redux";
import PieceOfText from "./piece-of-text";
import SignupForm from "./signup-form";
import { INVITATION_LANGUAGE_OPTIONS } from "./invitation-creation-form";

function mapStateToProps(state) {
  return { ...state.signUpForm, currentInvitation: state.currentInvitation };
}

const FREEFEED_INVITATION = {
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: <span>FreeFeed is a small non-profit social network. It does not sell your data, nor does it show ads to you. It is an <a href="https://github.com/FreeFeed">open-source project</a> which can be used by anyone. Freefeed is developed by a group of volunteers and paid for by donations from users.</span>,
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: <span>FreeFeed - маленькая бесплатная социальная сеть, которая не продаёт ваши данные и не показывает рекламу. Это проект с <a href="https://github.com/FreeFeed">открытым исходным кодом</a>, которым может воспользоваться любой желающий. Его развитием занимаются пользователи-волонтеры, на пожертвования других пользователей.</span>,
};

const USER_INVITED = {
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: (username) => `@${username} invited you to join Freefeed:`,
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: (username) => `Вы получили приглашение от @${username}:`
};

const INVITE_EXPIRED = {
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: <span>This invitation has already expired. Check out <a href="../">Freefeed!</a></span>,
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: <span>Это приглашение уже было использовано. Посмотрите <a href="../">Freefeed!</a></span>,
};

class SignupByInvitation extends React.PureComponent {
  render() {
    const { error } = this.props;
    return (
      <div className="box signup-by-invite">
        <div className="box-header-timeline">
          Sign up by invitation
        </div>
        <div className="box-body">
          <div className="col-md-12">
            <h2 className="p-signin-header" />
            {error ? (
              <div className="alert alert-danger p-signin-error" role="alert">
                <span id="error-message">{error}</span>
              </div>
            ) : false}
            <div className="row">
              {this.renderInvitation()}
            </div>
          </div>
        </div>
        <div className="box-footer" />
      </div>
    );
  }

  renderInvitation = () => {
    const { currentInvitation } = this.props;
    const { message, lang, recommendations = { users: [] }, registrations_count, single_use } =
      currentInvitation.invitation || {};
    const userInvited = USER_INVITED[lang || "en"](recommendations.users[0]);
    const expired = registrations_count === 1 && single_use;
    return (
      <div>
        <p>{FREEFEED_INVITATION[lang]}</p>
        <p><PieceOfText text={userInvited} isExpanded={true} /></p>
        <div className="personal-message"><PieceOfText text={message || "still loading"} isExpanded={true} /></div>
        {expired && INVITE_EXPIRED[lang]}
        {!expired &&
          <div className="col-md-6">
            <SignupForm invitation={currentInvitation.invitation} lang={lang} />
          </div>
        }
      </div>);
  };
}

export default connect(mapStateToProps)(SignupByInvitation);
