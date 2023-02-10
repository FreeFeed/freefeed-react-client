import { useCallback, useMemo, useState } from 'react';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from './dialog';
import { OverlayPopup } from './overlay-popup';

export function useActionWithConfirmation({ renderTrigger, title, actionLabel, action, body }) {
  const [isOpened, setIsOpened] = useState(false);
  const [doOpen, doClose] = useMemo(() => [() => setIsOpened(true), () => setIsOpened(false)], []);

  const doAction = useCallback(() => {
    doClose();
    action();
  }, [doClose, action]);

  return (
    <>
      {renderTrigger(doOpen)}
      {isOpened && (
        <OverlayPopup close={doClose}>
          <Dialog>
            <DialogHeader>{title}</DialogHeader>
            <DialogBody>{body}</DialogBody>
            <DialogFooter>
              <button className="btn btn-primary" onClick={doAction} autoFocus>
                {actionLabel}
              </button>
              <button className="btn btn-link" onClick={doClose}>
                Cancel
              </button>
            </DialogFooter>
          </Dialog>
        </OverlayPopup>
      )}
    </>
  );
}
