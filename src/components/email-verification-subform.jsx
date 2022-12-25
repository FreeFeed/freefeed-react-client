import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendVerificationCode } from '../redux/action-creators';
import { groupErrClass } from './form-utils';
import { useServerInfo } from './hooks/server-info';

export function EmailVerificationSubform({ emailField, codeField, create = false }) {
  const dispatch = useDispatch();
  const sendStatus = useSelector((state) => state.sendVerificationCodeStatus);
  const [serverInfo, serverInfoStatus] = useServerInfo();

  const verificationEnabled = serverInfoStatus.success && serverInfo.emailVerificationEnabled;

  const shouldVerify = Boolean(
    verificationEnabled && emailField.meta.dirty && !emailField.meta.invalid,
  );

  const [lastSentTo, setLastSentTo] = useState('');

  const sendEmailCode = useCallback(() => {
    dispatch(sendVerificationCode(emailField.input.value, create ? 'sign-up' : 'update'));
    setLastSentTo(emailField.input.value);
  }, [create, dispatch, emailField.input.value]);

  return (
    shouldVerify && (
      <div className="alert alert-warning wider-input">
        <label htmlFor="emailCode-input">Email verification</label>
        <p className="help-block">
          To confirm {create ? 'your' : 'updated'} email address, please click{' '}
          <button
            className="btn btn-default"
            type="button"
            onClick={sendEmailCode}
            disabled={sendStatus.loading}
          >
            Send Code
          </button>{' '}
          and enter the code that we will send to <strong>{emailField.input.value}</strong>.
        </p>
        {sendStatus.loading && (
          <p className="text-info">
            Sending code to <strong>{lastSentTo}</strong>...
          </p>
        )}
        {sendStatus.success && (
          <p className="text-success">
            Code was sent to <strong>{lastSentTo}</strong>, please check your mailbox (and,
            probably, the Spam folder)
          </p>
        )}
        {sendStatus.error && (
          <p className="text-danger">
            Error sending to <strong>{lastSentTo}</strong>: {sendStatus.errorText}
          </p>
        )}
        <p className={groupErrClass(codeField, true)}>
          <input
            id="emailCode-input"
            className="form-control narrow-input"
            type="text"
            autoComplete="off"
            placeholder="Code from email"
            {...codeField.input}
          />
        </p>
      </div>
    )
  );
}
