import { useCallback, useMemo } from 'react';

export function useFileChooser(onChoose, { accept, multiple = false }) {
  const fileInput = useMemo(() => {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept) {
      input.accept = accept;
    }
    if (multiple) {
      input.multiple = true;
    }
    input.addEventListener('change', () => {
      for (let i = 0; i < input.files.length; i++) {
        onChoose(input.files[i]);
      }
      input.value = ''; // reset input state
    });
    return input;
  }, [onChoose, accept, multiple]);

  const choose = useCallback(() => fileInput.click(), [fileInput]);
  return choose;
}
