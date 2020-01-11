import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { faExclamationTriangle, faCheck } from '@fortawesome/free-solid-svg-icons';

import { updateUserPicture } from '../../../redux/action-creators';
import { Throbber } from '../../throbber';
import { Icon } from '../../fontawesome-icons';
import styles from './forms.module.scss';

export default function ProfilePictureForm() {
  const dispatch = useDispatch();
  const pictureURL = useSelector((state) => state.user.profilePictureLargeUrl);
  const pictureStatus = useSelector((state) => state.settingsForms.updatePictureStatus);
  const onUpdate = useCallback((file) => dispatch(updateUserPicture(file)), [dispatch]);

  return <PictureEditForm {...{ pictureURL, pictureStatus, onUpdate }} />;
}

export function PictureEditForm({ pictureURL, pictureStatus, onUpdate }) {
  const fileInput = useMemo(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg, image/png, image/gif';
    input.addEventListener('input', () => {
      onUpdate(input.files[0]);
      input.value = ''; // reset input state
    });
    return input;
  }, [onUpdate]);

  const choosePictureFile = useCallback(() => pictureStatus.loading || fileInput.click(), [
    fileInput,
    pictureStatus,
  ]);

  return (
    <div className="media">
      <div className="media-left">
        <img
          src={pictureURL}
          width="75"
          height="75"
          className={`media-object ${styles.profilePicture}`}
          onClick={choosePictureFile}
        />
      </div>
      <div className="media-body">
        <p>
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
