import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserInfo } from '../../redux/action-creators';

// The order is important here because we looking for substring in screenName.
// So the 'Very low' should precede the 'Low' and so on.
export const fundingStatuses = ['Very good', 'Good', 'OK', 'Very low', 'Low', 'Critical'];

export function useDonationStatus(accountName) {
  const dispatch = useDispatch();
  const loadingStatus = useSelector((state) => state.donationLoadingStatus);
  const status = useSelector((state) => state.donationAccount.screenName);

  // Load the status initially
  useEffect(
    () =>
      void (
        loadingStatus.initial &&
        accountName &&
        dispatch(getUserInfo(accountName, { donationAccount: true }))
      ),
    [accountName, loadingStatus.initial, dispatch],
  );

  const statusText = useMemo(() => {
    if (loadingStatus.success) {
      return (
        fundingStatuses.find((s) => status.toLowerCase().includes(s.toLowerCase())) || 'Unknown'
      );
    } else if (loadingStatus.error) {
      return 'Load error';
    }
    return 'Loading\u2026';
  }, [loadingStatus, status]);

  return accountName ? statusText : null;
}
