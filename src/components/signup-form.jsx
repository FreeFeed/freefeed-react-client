/* global CONFIG */
import { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';
import Recaptcha from 'react-google-recaptcha';
import isEmail from 'validator/lib/isEmail';
import { useField, useForm } from 'react-final-form-hooks';

import { signUp } from '../redux/action-creators';
import { FieldsetWrapper } from './fieldset-wrapper';
import { providerTitle, useExtAuthProviders } from './ext-auth-helpers';
import { Throbber } from './throbber';

const captchaKey = CONFIG.captcha.siteKey;

const initialValues = (extProfile) => ({
  username: extProfile.username || '',
  screenname: extProfile.name || '',
  email: extProfile.email || '',
  password: '',
  captcha: null,
  subscribe: true,
  connectExtProfile: true,
  importProfilePicture: true,
});

const validate = ({ withExtProfile = true, withCaptcha = true } = {}) => (values) => {
  // Use '' to mark field as erroneous but not set a error message
  const shouldBe = (test, message = '') => (test ? undefined : message);

  const errors = {};
  errors.username = shouldBe(/^[a-z\d]{3,25}$/i.test(values.username.trim()));
  if (USERNAME_STOP_LIST.has(values.username.trim())) {
    errors.username = 'Reserved username. Please select another one.';
  }
  errors.screenname = shouldBe(/^.{3,25}$/i.test(values.screenname.trim()));
  errors.email = shouldBe(isEmail(values.email.trim()));
  errors.password = shouldBe(
    (withExtProfile && values.connectExtProfile) ||
      values.password.trim().length >= CONFIG.minPasswordLength,
  );
  errors.captcha = shouldBe(!withCaptcha || values.captcha !== null);

  return errors;
};

const onSubmit = ({
  dispatch,
  externalProfileKey,
  withCaptcha,
  invitationId,
  profilePictureURL,
}) => (values) => {
  const reqData = {
    username: values.username.trim(),
    screenName: values.screenname.trim(),
    email: values.email.trim(),
  };

  if (externalProfileKey && values.connectExtProfile) {
    reqData.externalProfileKey = externalProfileKey;
  } else {
    reqData.password = values.password.trim();
  }
  if (withCaptcha) {
    reqData.captcha = values.captcha;
  }
  if (invitationId) {
    reqData.invitation = invitationId;
    reqData.cancel_subscription = !values.subscribe;
  }
  if (profilePictureURL && values.importProfilePicture) {
    reqData.profilePictureURL = profilePictureURL;
  }

  dispatch(signUp(reqData));
};

export default memo(function SignupForm({ invitationId = null, lang = 'en' }) {
  const dispatch = useDispatch();
  const signUpStatus = useSelector((state) => state.signUpStatus);
  const extProfile = useSelector((state) => {
    const res = state.extAuth.signInResult;
    if (res.status !== 'continue') {
      return null;
    }
    return {
      ...res.profile,
      username: res.suggestedUsername,
      key: res.externalProfileKey,
    };
  });
  const [providers] = useExtAuthProviders();

  const extProfileProvider = useMemo(() => providers.find((p) => p.id === extProfile?.provider), [
    extProfile,
    providers,
  ]);

  const form = useForm(
    useMemo(
      () => ({
        onSubmit: onSubmit({
          dispatch,
          invitationId,
          withCaptcha: !!captchaKey,
          externalProfileKey: extProfile && extProfile.key,
          profilePictureURL: extProfile && extProfile.pictureURL,
        }),
        validate: validate({ withExtProfile: !!extProfile, withCaptcha: !!captchaKey }),
        initialValues: initialValues(extProfile || {}),
      }),
      [dispatch, extProfile, invitationId],
    ),
  );

  const username = useField('username', form.form);
  const screenname = useField('screenname', form.form);
  const email = useField('email', form.form);
  const password = useField('password', form.form);
  const captcha = useField('captcha', form.form);
  const subscribe = useField('subscribe', form.form);
  const connectExtProfile = useField('connectExtProfile', form.form);
  const importProfilePicture = useField('importProfilePicture', form.form);

  const setCaptcha = useCallback((v) => captcha.input.onChange(v), [captcha.input]);
  const reCaptcha = useRef();
  // Reset reCaptcha on form errors so user can try again
  useEffect(() => void (signUpStatus.error && reCaptcha.current && reCaptcha.current.reset()), [
    signUpStatus.error,
  ]);

  const enRu = (enString, ruString) => (lang === 'ru' ? ruString : enString);
  const groupErrClass = (field, baseClass = 'form-group') =>
    cn(baseClass, field.meta.touched && field.meta.error !== undefined && 'has-error');

  const showPassword = useMemo(() => !extProfile || !connectExtProfile.input.value, [
    connectExtProfile.input.value,
    extProfile,
  ]);

  return (
    <form onSubmit={form.handleSubmit}>
      <FieldsetWrapper disabled={signUpStatus.loading}>
        {extProfile && extProfile.pictureURL && (
          <div className={groupErrClass(importProfilePicture, 'checkbox')}>
            <p>
              <img
                src={extProfile.pictureURL}
                className={cn('signup-userpic', !importProfilePicture.input.value && 'disabled')}
              />
            </p>
            <p>
              <label>
                <input
                  type="checkbox"
                  value="1"
                  checked={importProfilePicture.input.value}
                  {...importProfilePicture.input}
                />
                {enRu('Use this profile picture', 'Использовать эту картинку как аватар')}
              </label>
            </p>
          </div>
        )}

        <div className={groupErrClass(username)}>
          <label htmlFor="username-input">{enRu('Username', 'Логин')}</label>
          <input
            id="username-input"
            className="form-control narrow-input"
            type="text"
            autoFocus
            maxLength="25"
            autoComplete="username"
            {...username.input}
          />
          <p className="help-block">
            {enRu(
              'From 3 to 25 characters: latin letters a..z, digits 0..9',
              'От 3 до 25 символов: латинские буквы a..z, цифры 0..9',
            )}
          </p>
          {username.meta.error && <p className="help-block">{username.meta.error}</p>}
        </div>
        <div className={groupErrClass(screenname)}>
          <label htmlFor="screenname-input">{enRu('Screen Name', 'Имя')}</label>
          <input
            id="screenname-input"
            className="form-control narrow-input"
            type="text"
            maxLength="25"
            autoComplete="name"
            {...screenname.input}
          />
          <p className="help-block">{enRu('From 3 to 25 characters', 'От 3 до 25 символов')}</p>
        </div>
        <div className={groupErrClass(email)}>
          <label htmlFor="email-input">Email</label>
          <input
            id="email-input"
            className="form-control narrow-input"
            type="email"
            autoComplete="email"
            inputMode="email"
            {...email.input}
          />
        </div>

        {showPassword && (
          <div className={groupErrClass(password)}>
            <label htmlFor="password-input">{enRu('Password', 'Пароль')}</label>
            <input
              id="password-input"
              className="form-control narrow-input"
              type="password"
              autoComplete="new-password"
              {...password.input}
            />
            <p className="help-block">
              {enRu(
                `At least ${CONFIG.minPasswordLength} characters`,
                `Минимум ${CONFIG.minPasswordLength} символов`,
              )}
            </p>
          </div>
        )}

        {(invitationId || extProfile) && (
          <div className="form-group">
            <strong>After you sign up:</strong>
          </div>
        )}

        {invitationId && (
          <div className={groupErrClass(subscribe, 'checkbox')}>
            <label>
              <input
                type="checkbox"
                value="1"
                checked={subscribe.input.value}
                {...subscribe.input}
              />{' '}
              {enRu(
                'Subscribe to recommended users and groups',
                'Подписаться на рекомендованных пользователей и группы',
              )}
            </label>
          </div>
        )}

        {extProfile && (
          <div className={groupErrClass(connectExtProfile, 'checkbox')}>
            <label>
              <input
                type="checkbox"
                value="1"
                checked={connectExtProfile.input.value}
                {...connectExtProfile.input}
              />{' '}
              {enRu(
                <>
                  Allow to sign in via {providerTitle(extProfileProvider, { withText: false })}{' '}
                  {extProfile.name} account
                </>,
                <>
                  Разрешить вход через аккаунт{' '}
                  {providerTitle(extProfileProvider, { withText: false })} {extProfile.name}
                </>,
              )}
            </label>
          </div>
        )}

        {captchaKey && (
          <div className={groupErrClass(captcha)}>
            <Recaptcha
              ref={reCaptcha}
              sitekey={captchaKey}
              theme="light"
              type="image"
              onChange={setCaptcha}
            />
          </div>
        )}

        <div className="form-group">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={signUpStatus.loading || form.hasValidationErrors}
          >
            {enRu('Create account', 'Создать аккаунт')}
          </button>{' '}
          {signUpStatus.loading && <Throbber />}
        </div>
        {signUpStatus.error && (
          <p className="alert alert-danger" role="alert">
            {signUpStatus.errorText}
          </p>
        )}
      </FieldsetWrapper>
    </form>
  );
});

const USERNAME_STOP_LIST = new Set([
  'anonymous',
  'public',
  'about',
  'signin',
  'logout',
  'signup',
  'filter',
  'settings',
  'account',
  'groups',
  'friends',
  'list',
  'search',
  'summary',
  'share',
  '404',
  'iphone',
  'attachments',
  'files',
  'profilepics',
  'invite',
  'invited',
]);
