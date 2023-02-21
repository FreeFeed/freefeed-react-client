import { useContext, createContext, useCallback, useState } from 'react';
import { OverlayPopup } from '../overlay-popup';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from './dialog';

const ctx = createContext(() => {});

export function useShowDialog(dlg) {
  const open = useContext(ctx);
  return useCallback(() => open(dlg), [dlg, open]);
}

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const close = useCallback(() => setDialog(null), []);
  const act = useCallback(() => (dialog.action(), close()), [close, dialog]);

  return (
    <>
      <ctx.Provider value={setDialog}>{children}</ctx.Provider>
      {dialog && (
        <OverlayPopup close={close}>
          <Dialog>
            <DialogHeader>{dialog.title}</DialogHeader>
            <DialogBody>{dialog.body}</DialogBody>
            <DialogFooter>
              <button className="btn btn-primary" onClick={act} autoFocus>
                {dialog.actionLabel}
              </button>
              <button className="btn btn-link" onClick={close}>
                Cancel
              </button>
            </DialogFooter>
          </Dialog>
        </OverlayPopup>
      )}
    </>
  );
}
