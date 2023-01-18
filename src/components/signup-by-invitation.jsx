/* global CONFIG */
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getInvitation } from '../redux/action-creators';
import { combineAsyncStates } from '../redux/async-helpers';
import PieceOfText from './piece-of-text';
import SignupForm from './signup-form';
import { INVITATION_LANGUAGE_OPTIONS } from './invitation-creation-form';
import { useServerInfo } from './hooks/server-info';
import UserName from './user-name';

const FREEFEED_INVITATION = {
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: (
    <>
      FreeFeed is a small non-profit social network. It does not sell your data, nor does it show
      ads to you. It is an <a href="https://github.com/FreeFeed">open-source project</a> which can
      be used by anyone. FreeFeed is developed by a group of volunteers and paid for by donations
      from users.
    </>
  ),
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: (
    <>
      FreeFeed - маленькая бесплатная социальная сеть, которая не продаёт ваши данные и не
      показывает рекламу. Это проект с{' '}
      <a href="https://github.com/FreeFeed">открытым исходным кодом</a>, которым может
      воспользоваться любой желающий. Его развитием занимаются пользователи-волонтеры, на
      пожертвования других пользователей.
    </>
  ),
};

const USER_INVITED = {
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: (username, authenticated) =>
    !authenticated
      ? `@${username} invited you to join ${CONFIG.siteTitle}:`
      : `Invitation created by @${username}:`,
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: (username, authenticated) =>
    !authenticated
      ? `Вы получили приглашение от @${username}:`
      : `Приглашение, созданное @${username}:`,
};

const INVITE_EXPIRED = {
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: (
    <>
      This invitation has already expired. Check out <a href="../">{CONFIG.siteTitle}</a>
    </>
  ),
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: (
    <>
      Приглашение истекло или уже было использовано. <a href="../">Продолжить</a>
    </>
  ),
};

const MULTI_USE_DISABLED = {
  [INVITATION_LANGUAGE_OPTIONS.ENGLISH]: (username) => (
    <>
      Registrations via this link have been paused. Please contact @<UserName user={{ username }} />{' '}
      for a new registration link.
    </>
  ),
  [INVITATION_LANGUAGE_OPTIONS.RUSSIAN]: (username) => (
    <>
      Регистрации по этой ссылке приостановлены. Пожалуйста, свяжитесь с @
      <UserName user={{ username }} />, чтобы получить новую ссылку для регистрации.
    </>
  ),
};

export default function SignupByInvitation({ params: { invitationId } }) {
  const dispatch = useDispatch();
  const invitationStatus = useSelector((state) => state.currentInvitationStatus);
  const invitation = useSelector((state) => state.currentInvitation);
  const [, serverInfoStatus] = useServerInfo();

  const readyStatus = combineAsyncStates(invitationStatus, serverInfoStatus);

  useEffect(
    () => void (invitationStatus.initial && dispatch(getInvitation(invitationId))),
    [dispatch, invitationId, invitationStatus.initial],
  );

  return (
    <div className="box signup-by-invite">
      <div className="box-header-timeline" role="heading">
        Welcome to {CONFIG.siteTitle}!
      </div>
      <div className="box-body">
        <div className="col-md-12">
          <h2 className="p-signin-header" />
          <div className="row">
            {readyStatus.loading && <p>Loading...</p>}
            {readyStatus.error && <p className="alert alert-danger">{readyStatus.errorText}</p>}
            {readyStatus.success && (
              <div>
                <p>{FREEFEED_INVITATION[invitation.lang]}</p>
                <Invitation invitation={invitation} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="box-footer" />
    </div>
  );
}

function Invitation({ invitation = {} }) {
  const authenticated = useSelector((state) => state.authenticated);
  const authorUsername = useSelector((state) => state.users[invitation.author]?.username);
  const [serverInfo] = useServerInfo();

  const { message, lang, registrations_count, single_use, secure_id } = invitation;
  const userInvitedMsg = USER_INVITED[lang || 'en'](authorUsername, authenticated);
  const multiUseDisabledMsg = MULTI_USE_DISABLED[lang || 'en'](authorUsername);

  const isExpired = single_use && registrations_count === 1;
  const isMultiUseDisabled = !single_use && !serverInfo.multiUseInvitesEnabled;

  return isExpired ? (
    <p>{INVITE_EXPIRED[lang]}</p>
  ) : (
    <>
      <p>
        <PieceOfText text={userInvitedMsg} isExpanded={true} />
      </p>
      <div className="personal-message">
        <PieceOfText text={message} isExpanded={true} />
      </div>
      {!authenticated &&
        (isMultiUseDisabled ? (
          <p>{multiUseDisabledMsg}</p>
        ) : (
          <div className="signup-form-container">
            <SignupForm invitationId={secure_id} lang={lang} />
          </div>
        ))}
    </>
  );
}
