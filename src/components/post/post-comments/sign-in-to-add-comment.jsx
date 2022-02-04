import { Icon } from '../../fontawesome-icons';
import { faCommentPlus } from '../../fontawesome-custom-icons';
import { SignInLink } from '../../sign-in-link';

export function SignInToAddComment() {
  return (
    <div className="comment">
      <span className="comment-icon fa-stack">
        <Icon icon={faCommentPlus} />
      </span>
      <span>
        <SignInLink>Sign in</SignInLink> to add comment
      </span>
    </div>
  );
}
