const platform = navigator.userAgentData?.platform ?? navigator.platform;
export const isWindows = platform ? platform === 'Windows' : navigator.userAgent.includes('Win');
export const isIos =
  !isWindows &&
  ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
    platform,
  );
