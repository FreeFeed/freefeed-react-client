import {
  faCheckCircle,
  faCheckSquare,
  faBan,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  faCheckCircle as faCheckCircleO,
  faClock as faClockO,
} from '@fortawesome/free-regular-svg-icons';
import { Icon } from './fontawesome-icons';

export default function UserRelationshipStatus(props) {
  return (
    <span>
      {props.isUserBlockedByMe ? (
        <span>
          <Icon icon={faBan} className="status-icon" /> You{"'"}ve blocked the user
        </span>
      ) : props.amIBlockedByUser ? (
        <span>
          <Icon icon={faQuestionCircle} className="status-icon" /> User may have blocked you
        </span>
      ) : props.hasRequestBeenSent ? (
        <span>
          <Icon icon={faClockO} className="status-icon" /> You{"'"}ve sent sub request
        </span>
      ) : props.amISubscribedToUser ? (
        props.type === 'user' ? (
          props.isUserSubscribedToMe ? (
            <span>
              <Icon icon={faCheckCircle} className="status-icon" /> Mutually subscribed
            </span>
          ) : (
            <span>
              <Icon icon={faCheckCircle} className="status-icon" /> You are subscribed
            </span>
          )
        ) : props.amIGroupAdmin ? (
          <span>
            <Icon icon={faCheckSquare} className="status-icon" /> You are an admin
          </span>
        ) : (
          <span>
            <Icon icon={faCheckSquare} className="status-icon" /> You are a member
          </span>
        )
      ) : props.isUserSubscribedToMe ? (
        <span>
          <Icon icon={faCheckCircleO} className="status-icon" /> User subscribed to you
        </span>
      ) : (
        false
      )}
    </span>
  );
}
