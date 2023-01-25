import { CODE_ENTER, CODE_TAB, CODE_ESCAPE, CODE_UP, CODE_DOWN } from 'keycode-js';
import { forwardRef, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import getCaretCoordinates from 'textarea-caret';
import getInputSelection, { setCaretPosition } from 'get-input-selection';
import { submittingByEnter } from '../services/appearance';
import { subscriptions, subscribers } from '../redux/action-creators';
import { useForwardedRef } from './hooks/forward-ref';
import styles from './mention-textarea.module.scss';

const OPTION_LIST_Y_OFFSET = 20;
const OPTION_LIST_MIN_WIDTH = 150;

const propTypes = {
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  maxOptions: PropTypes.number,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  onRequestOptions: PropTypes.func,
  onSelect: PropTypes.func,
  changeOnSelect: PropTypes.func,
  regex: PropTypes.string,
  matchAny: PropTypes.bool,
  minChars: PropTypes.number,
  requestOnlyIfNoOptions: PropTypes.bool,
  spaceRemovers: PropTypes.arrayOf(PropTypes.string),
  spacer: PropTypes.string,
  trigger: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  options: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.string)]),
};

const defaultProps = {
  value: null,
  disabled: false,
  defaultValue: '',
  onChange: () => {},
  onKeyDown: () => {},
  onRequestOptions: () => {},
  onSelect: () => {},
  changeOnSelect: (trigger, slug) => trigger + slug,
  regex: '^[A-Za-z0-9\\-_]+$',
  matchAny: false,
  minChars: 0,
  requestOnlyIfNoOptions: true,
  spaceRemovers: [',', '.', '!', '?'],
  spacer: ' ',
  trigger: '@',
};

export const SubmittableTextarea = forwardRef(function SubmittableTextarea(
  { onSubmit, component: Component = Textarea, ...props },
  fwdRef,
) {
  const ref = useForwardedRef(fwdRef, null);
  const [helperVisible, setHelperVisible] = useState(false);
  const [left, setLeft] = useState(0);
  const [corner, setCorner] = useState(0);
  const [selection, setSelection] = useState(0);
  const [top, setTop] = useState(0);
  const [matchStart, setMatchStart] = useState(0);
  const [matchLength, setMatchLength] = useState(0);

  const [options, setOptions] = useState([]);
  let recentValue = props.value;
  let enableSpaceRemovers = false;

  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.authenticated);
  const thisUsername = useSelector((state) => state.user.username || null);
  const submitMode = useSelector((state) => state.submitMode);

  useEffect(
    () =>
      void (
        authenticated &&
        (dispatch(subscriptions(thisUsername)), dispatch(subscribers(thisUsername)))
      ),
    [authenticated, dispatch, thisUsername],
  );

  const allSubscribers = useSelector((state) => state.usernameSubscribers.payload);
  const subscribersUsername = Object.values(allSubscribers).map((e) => e.username);
  const allSubscriptions = useSelector((state) => state.usernameSubscriptions.payload);
  const subscriptionsUsername = Object.values(allSubscriptions).map((e) => e.username);
  const usersNames = subscribersUsername.concat(
    subscriptionsUsername.filter((item) => !subscribersUsername.includes(item)),
  );
  usersNames.sort();

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    //window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      //window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    const h = (event) => {
      if (event.key !== CODE_ENTER) {
        return;
      }

      if (submittingByEnter(submitMode)) {
        /**
         * The Enter press acts as submit unless the Shift or Alt key is
         * pressed.
         */

        if (event.shiftKey) {
          return;
        }

        if (event.altKey) {
          const { target } = event;
          const { value, selectionStart, selectionEnd } = target;
          target.value = `${value.slice(0, selectionStart)}\n${value.slice(selectionEnd)}`;
          target.selectionStart = selectionStart + 1;
          target.selectionEnd = selectionStart + 1;
          event.preventDefault();
          return;
        }
      } else if (!(event.ctrlKey || event.metaKey)) {
        /**
         * The Ctrl/Cmd+Enter press acts as submit
         */
        return;
      }

      event.preventDefault();
      onSubmit();
    };

    el.addEventListener('keydown', h);
    return () => el.removeEventListener('keydown', h);
  }, [submitMode, ref, onSubmit]);

  const getMatch = (str, caret, providedOptions) => {
    const { trigger, matchAny, regex } = defaultProps;
    const re = new RegExp(regex);

    let triggers = trigger;
    if (!Array.isArray(triggers)) {
      triggers = new Array(trigger);
    }
    triggers.sort();

    const providedOptionsObject = providedOptions;
    if (Array.isArray(providedOptions)) {
      triggers.forEach((triggerStr) => {
        providedOptionsObject[triggerStr] = providedOptions;
      });
    }

    const triggersMatch = arrayTriggerMatch(triggers, re);
    let slugData = null;

    for (const { triggerStr, triggerMatch, triggerLength } of triggersMatch) {
      for (let i = caret - 1; i >= 0; --i) {
        const substr = str.slice(i, caret);
        const match = substr.match(re);
        let matchStart = -1;

        if (triggerLength > 0) {
          const triggerIdx = triggerMatch ? i : i - triggerLength + 1;

          if (triggerIdx < 0) {
            break;
          }

          if (isTrigger(triggerStr, str, triggerIdx)) {
            matchStart = triggerIdx + triggerLength;
          }
          if (!match && matchStart < 0) {
            break;
          }
        } else {
          if (match && i > 0) {
            continue;
          }
          matchStart = i === 0 && match ? 0 : i + 1;

          if (caret - matchStart === 0) {
            break;
          }
        }

        if (matchStart >= 0) {
          const triggerOptions = providedOptionsObject[triggerStr];
          if (triggerOptions == null) {
            continue;
          }

          const matchedSlug = str.slice(matchStart, caret);

          const options = triggerOptions.filter((slug) => {
            const idx = slug.toLowerCase().indexOf(matchedSlug.toLowerCase());
            return idx !== -1 && (matchAny || idx === 0);
          });

          const currTrigger = triggerStr;
          const matchLength = matchedSlug.length;

          if (slugData === null) {
            slugData = {
              trigger: currTrigger,
              matchStart,
              matchLength,
              options,
            };
          } else {
            slugData = {
              ...slugData,
              trigger: currTrigger,
              matchStart,
              matchLength,
              options,
            };
          }
        }
      }
    }

    return slugData;
  };

  const arrayTriggerMatch = (triggers, re) => {
    const triggersMatch = triggers.map((trigger) => ({
      triggerStr: trigger,
      triggerMatch: trigger.match(re),
      triggerLength: trigger.length,
    }));

    return triggersMatch;
  };

  const isTrigger = (trigger, str, i) => {
    if (!trigger || trigger.length === 0) {
      return true;
    }

    if (str.slice(i, i + trigger.length) === trigger) {
      return true;
    }

    return false;
  };

  const handleChange = (e) => {
    const { onChange, spaceRemovers, spacer } = props;
    const old = recentValue;
    const str = e.target.value;
    const caret = getInputSelection(e.target).end;

    if (str.length === 0) {
      setHelperVisible(false);
    }

    recentValue = str;

    if (str.length === 0 || !caret) {
      return onChange(e.target.value);
    }

    if (enableSpaceRemovers && spaceRemovers.length > 0 && str.length > 2 && spacer.length > 0) {
      for (let i = 0; i < Math.max(old.length, str.length); ++i) {
        if (old[i] !== str[i]) {
          if (
            i >= 2 &&
            str[i - 1] === spacer &&
            !spaceRemovers.includes(str[i - 2]) &&
            spaceRemovers.includes(str[i]) &&
            getMatch(str.slice(0, Math.max(0, i - 2)), caret - 3, usersNames)
          ) {
            const newValue = `${str.slice(0, i - 1)}${str.slice(i, i + 1)}${str.slice(
              i - 1,
              i,
            )}${str.slice(i + 1)}`;

            updateCaretPosition(i + 1);
            ref.current.value = newValue;

            return onChange(newValue);
          }

          break;
        }
      }

      enableSpaceRemovers = false;
    }

    updateHelper(str, caret, usersNames);

    return onChange(e.target.value);
  };

  const handleKeyDown = useCallback(
    (event) => {
      if (helperVisible) {
        const element = document.querySelector('#mentionItemsbody');
        if (event.code === CODE_ESCAPE) {
          event.preventDefault();
          resetHelper();
        } else if (event.code === CODE_TAB) {
          event.preventDefault();
          handleSelection(selection);
        } else if (event.code === CODE_UP && selection >= 1) {
          event.preventDefault();
          setSelection(selection - 1);
          element.scrollTop = (selection - 2) * 44;
        } else if (event.code === CODE_DOWN && selection < options.length - 1) {
          event.preventDefault();
          setSelection(selection + 1);
          element.scrollTop = selection * 44;
        }
      }
    },
    [helperVisible, options, selection, handleSelection],
  );

  const handleResize = () => {
    setHelperVisible(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSelection = useCallback((idx) => {
    const { spacer, onSelect, changeOnSelect, trigger } = props;

    const slug = options[idx];
    const value = recentValue;
    const part1 =
      trigger.length === 0 ? '' : value.slice(0, Math.max(0, matchStart - trigger.length));
    const part2 = value.slice(Math.max(0, matchStart + matchLength));

    const event = { target: ref.current };
    const changedStr = changeOnSelect(trigger, slug);

    event.target.value = `${part1}${changedStr}${spacer}${part2}`;
    handleChange(event);
    onSelect(event.target.value);

    resetHelper();

    updateCaretPosition(part1.length + changedStr.length + 1);

    enableSpaceRemovers = true;
  });

  const updateCaretPosition = (caret) => {
    setCaretPosition(ref.current, caret);
  };

  const updateHelper = (str, caret, options) => {
    const input = ref.current;

    const slug = getMatch(str, caret, options);

    if (slug) {
      const caretPos = getCaretCoordinates(input, caret);
      const rect = input.getBoundingClientRect();

      const top = caretPos.top + input.offsetTop;
      const left = Math.min(
        caretPos.left + input.offsetLeft - OPTION_LIST_Y_OFFSET,
        input.offsetLeft + rect.width - OPTION_LIST_MIN_WIDTH,
      );
      const corner = Math.min(caretPos.left + input.offsetLeft, input.offsetLeft + rect.width);
      const { minChars, onRequestOptions, requestOnlyIfNoOptions } = props;
      if (
        slug.matchLength >= minChars &&
        (slug.options.length > 1 ||
          (slug.options.length === 1 && slug.options[0].length !== slug.matchLength))
      ) {
        setHelperVisible(true);
        setTop(top);
        setLeft(left);
        setCorner(corner);
        setMatchStart(slug.matchStart);
        setMatchLength(slug.matchLength);
        setOptions(slug.options);
      } else {
        if (!requestOnlyIfNoOptions || slug.options.length === 0) {
          onRequestOptions(str.slice(slug.matchStart, slug.matchStart + slug.matchLength));
        }

        resetHelper();
      }
    } else {
      resetHelper();
    }
  };

  const resetHelper = () => {
    setHelperVisible(false);
    setSelection(0);
  };

  const onBlur = () => {
    resetHelper();
  };

  const renderAutocompleteList = () => {
    if (!helperVisible) {
      return null;
    }

    const maxOptions = options.length;
    if (options.length === 0) {
      return null;
    }
    if (selection >= options.length) {
      setSelection(0);

      return null;
    }

    const optionNumber = maxOptions === 0 ? options.length : maxOptions;

    const helperOptions = options.slice(0, optionNumber).map((val, idx) => {
      const highlightStart = val
        .toLowerCase()
        .indexOf(value.slice(matchStart, matchStart + matchLength).toLowerCase());
      return (
        <div
          className={idx === selection ? styles.activeMention : styles.mentionItemsbodycontent}
          key={val}
          /* eslint-disable-next-line react/jsx-no-bind */
          onMouseDown={() => {
            event.preventDefault();
            handleSelection(idx);
          }}
          /* eslint-disable-next-line react/jsx-no-bind */
          onPointerEnter={() => {
            event.preventDefault();
            setSelection(idx);
          }}
        >
          <span>
            {' '}
            {val.slice(0, highlightStart)}
            <strong>{val.slice(highlightStart, highlightStart + matchLength)}</strong>
            {val.slice(highlightStart + matchLength)}
          </span>
        </div>
      );
    });

    return (
      <>
        <div className={styles.mentionCorner} style={{ left: corner, top }} />
        <div className={styles.mentionContainer} style={{ left, top }}>
          <div className={styles.mentionItems}>
            <div id="mentionItemsbody" className={styles.mentionItemsbody}>
              {helperOptions}
            </div>
          </div>
        </div>
      </>
    );
  };

  const { defaultValue, value, disabled, ...rest } = props;
  const propagated = Object.assign({}, rest);
  Object.keys(propTypes).forEach((k) => {
    delete propagated[k];
  });

  let val = '';

  if (typeof value !== 'undefined' && value !== null) {
    val = value;
  } else if (value) {
    val = value;
  } else if (defaultValue) {
    val = defaultValue;
  }

  return (
    <>
      <div>
        <Component
          disabled={disabled}
          /* eslint-disable-next-line react/jsx-no-bind */
          onBlur={onBlur}
          /* eslint-disable-next-line react/jsx-no-bind */
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={ref}
          value={val}
          {...propagated}
        />
        {renderAutocompleteList()}
      </div>
    </>
  );
});

SubmittableTextarea.propTypes = propTypes;
SubmittableTextarea.defaultProps = defaultProps;
