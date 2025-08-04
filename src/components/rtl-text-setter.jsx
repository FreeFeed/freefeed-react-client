import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export function RtlTextSetter() {
  const frontendPreferences = useSelector((state) => state.user.frontendPreferences);

  const rtl = frontendPreferences?.rtl ?? globalThis.CONFIG.frontendPreferences.defaultValues.rtl;
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--default-rtl-direction',
      rtl.rightAlign ? 'rtl' : 'ltr',
    );
  }, [rtl]);

  return null;
}
