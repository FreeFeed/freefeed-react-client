import { useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { faExclamationTriangle, faCheck } from '@fortawesome/free-solid-svg-icons';

import { updateUserPicture } from '../../../redux/action-creators';
import { Throbber } from '../../throbber';
import { Icon } from '../../fontawesome-icons';
import { UserPicture } from '../../user-picture';
import styles from './forms.module.scss';

export default function ProfilePictureForm() {
  const dispatch = useDispatch();
  const pictureURL = useSelector((state) => state.user.profilePictureLargeUrl);
  const pictureStatus = useSelector((state) => state.settingsForms.updatePictureStatus);
  const onUpdate = useCallback((file) => dispatch(updateUserPicture(file)), [dispatch]);

  return <PictureEditForm {...{ pictureURL, pictureStatus, onUpdate }} />;
}

export function PictureEditForm({ pictureURL, pictureStatus, onUpdate }) {
  const fileInputRef = useRef(null);

  const choosePictureFile = useCallback(
    () => pictureStatus.loading || fileInputRef.current.click(),
    [fileInputRef, pictureStatus],
  );

  const onFileChange = useCallback(
    (event) => {
      onUpdate(event.target.files[0]);
      // We must empty input state to allow uploading the same file twice (which doesn't work in Chrome).
      // This could happen if a user uploads a userpic, then modifies the file and tries to upload
      // it again
      event.target.value = '';
    },
    [onUpdate],
  );

  const pseudoUser = useMemo(() => ({ profilePictureUrl: pictureURL }), [pictureURL]);

  return (
    <div className="media">
      <div className="media-left">
        <UserPicture
          large
          user={pseudoUser}
          onClick={choosePictureFile}
          className={styles.profilePicture}
        />
      </div>
      <div className="media-body">
        <p>
          <input
            id="userpic-input"
            type="file"
            disabled={pictureStatus.loading}
            onChange={onFileChange}
            accept="image/jpeg, image/png, image/gif"
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <button
            className="btn btn-default"
            type="button"
            onClick={choosePictureFile}
            disabled={pictureStatus.loading}
          >
            {pictureStatus.loading ? <>Updating picture</> : <>Update picture</>}
          </button>{' '}
          {pictureStatus.loading && <Throbber />}
        </p>
        {pictureStatus.error && (
          <p className="text-danger">
            <Icon icon={faExclamationTriangle} /> {pictureStatus.errorText}
          </p>
        )}
        {pictureStatus.success && (
          <p className="text-success">
            <Icon icon={faCheck} /> Updated!
          </p>
        )}
      </div>
    </div>
  );
}
