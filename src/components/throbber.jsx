import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

// eslint-disable-next-line import/no-unresolved
import Worker from 'worker-loader?inline=true!./throbber-worker';
import { startAnimation } from './throbber-animation';


export const SMALL = 'SMALL';
export const BIG = 'BIG';

// Do not show throbber first DELAY ms
const DELAY = 300;

export const Throbber = React.memo(function Throbber({ size = SMALL, delay = DELAY, className }) {
  const [waiting, setWaiting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setWaiting(false), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!waiting && size === SMALL) {
    return (
      <ThrobberOnCanvas
        size={16}
        strokeWidth={3}
        duration={1000}
        className={cn(className, 'throbber-image')}
      />
    );
  } else if (!waiting && size === BIG) {
    return (
      <ThrobberOnCanvas
        size={96}
        strokeWidth={12}
        duration={1500}
        className={cn(className, 'throbber-image')}
      />
    );
  }
  return null;
});

Throbber.propTypes = {
  size:      PropTypes.oneOf([SMALL, BIG]),
  delay:     PropTypes.number,
  className: PropTypes.string,
};

const ThrobberOnCanvas = React.memo(function ThrobberOnCanvas({
  size,
  duration,
  strokeWidth,
  className,
}) {
  // Do not track devicePixelRatio changes
  const dpr = window.devicePixelRatio || 1;
  const canvasRef = useRef(null);

  useEffect(() => {
    const animationParams = {
      duration,
      scale:       size * dpr / 16,
      strokeWidth: (strokeWidth * 16) / size,
    };

    if (canvasRef.current.transferControlToOffscreen) {
      const canvas = canvasRef.current.transferControlToOffscreen();
      const worker = new Worker();
      worker.postMessage({ ...animationParams, canvas }, [canvas]);
      return () => worker.terminate();
    }
    return startAnimation({ ...animationParams, canvas: canvasRef.current });
  }, [dpr, duration, size, strokeWidth]);

  return (
    <canvas
      ref={canvasRef}
      width={dpr * size}
      height={dpr * size}
      className={className}
      style={{
        width:  `${size}px`,
        height: `${size}px`
      }}
    />
  );
});

ThrobberOnCanvas.propTypes = {
  size:        PropTypes.number.isRequired,
  strokeWidth: PropTypes.number.isRequired,
  duration:    PropTypes.number.isRequired,
  className:   PropTypes.string,
};
