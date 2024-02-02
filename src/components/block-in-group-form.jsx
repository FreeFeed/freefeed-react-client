import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { blockUserInGroup } from '../redux/action-creators';

export function BlockInGroupForm({ groupName }) {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.blockUserInGroupStatus);

  const [text, setText] = useState('');
  const canSubmit = !!text.trim() && !status.loading;
  const onInput = useCallback((e) => setText(e.target.value), []);
  const onSubmit = useCallback(
    (e) => (e.preventDefault(), dispatch(blockUserInGroup(groupName, text.trim()))),
    [dispatch, groupName, text],
  );

  useEffect(() => {
    if (status.success) {
      setText('');
    }
  }, [status.success]);

  return (
    <form onSubmit={onSubmit}>
      <p className="input-group" style={{ maxWidth: '24em' }}>
        <input
          className="form-control"
          type="text"
          placeholder="username to block"
          value={text}
          onInput={onInput}
        />
        <span className="input-group-btn">
          <button className="btn btn-default" type="submit" disabled={!canSubmit}>
            Block!
          </button>
        </span>
      </p>
      {status.error && (
        <p className="alert alert-danger" role="alert">
          {status.errorText}
        </p>
      )}
    </form>
  );
}
