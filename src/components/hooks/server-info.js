import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getServerInfo } from '../../redux/action-creators';

export function useServerInfo() {
  const dispatch = useDispatch();
  const serverInfo = useSelector((state) => state.serverInfo);
  const status = useSelector((state) => state.serverInfoStatus);

  useEffect(() => void (status.initial && dispatch(getServerInfo())), [dispatch, status]);
  return [serverInfo, status];
}

export function useServerValue(selector, fallback) {
  const [info, status] = useServerInfo();
  return useMemo(
    () => (status.success ? selector(info) : fallback),
    [fallback, info, selector, status.success],
  );
}
