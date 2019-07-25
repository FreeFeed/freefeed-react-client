const KETCHUP_COLOR = '#d43e1b';
const MUSTARD_COLOR = '#f9b616';
const SNAKE_DURATION = 0.75;

export function startAnimation({
  strokeWidth,
  duration,
  scale,
  canvas: tgtCanvas,
}) {
  const tgtCtx = tgtCanvas.getContext('2d');

  // Buffer canvas
  let canvas;
  if (typeof document === 'undefined') {
    canvas = new OffscreenCanvas(tgtCanvas.width, tgtCanvas.height);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = tgtCanvas.width;
    canvas.height = tgtCanvas.height;
  }

  const ctx = canvas.getContext('2d');

  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.scale(scale, scale);

  // Drawing constants
  const snakeLength = 21.5524 - strokeWidth;
  const dotPathRadius = 11.5 - (strokeWidth / 2);
  const snakeOffsetMul = 2 * snakeLength / SNAKE_DURATION;
  const dotOffsetMul = -dotPathRadius * (Math.PI / 2) / (1 - SNAKE_DURATION);

  let startTime = 0;
  let frameId = 0;

  frameId = requestAnimationFrame(updateCanvas);

  // Return cancellation function
  return () => cancelAnimationFrame(frameId);

  // Functions

  function updateCanvas(time) {
    if (startTime === 0) {
      startTime = time;
    }

    const t = ((time - startTime) / duration)
      + (SNAKE_DURATION / 2); // Start at the middle of 'snake' phase to show full logo
    renderAt(t);
    tgtCtx.clearRect(0, 0, tgtCanvas.width, tgtCanvas.height);
    tgtCtx.drawImage(canvas, 0, 0);

    frameId = requestAnimationFrame(updateCanvas);
  }

  function renderAt(time) {
    time -= Math.floor(time);

    ctx.clearRect(0, 0, 16, 16);

    // Ketchup
    ctx.save();
    ctx.strokeStyle = KETCHUP_COLOR;
    drawHalf(time);
    ctx.restore();

    // Mustard
    ctx.save();
    ctx.translate(16, 16);
    ctx.scale(-1, -1);
    ctx.strokeStyle = MUSTARD_COLOR;
    drawHalf(time);
    ctx.restore();

    // Ketchup again over the mustard in the small area
    ctx.save();
    ctx.strokeStyle = KETCHUP_COLOR;
    drawHalf(time, true);
    ctx.restore();
  }

  function drawHalf(time, withMask = false) {
    if (time < SNAKE_DURATION) {
      if (withMask) {
        const region = new Path2D();
        region.rect(
          4.5 - (strokeWidth / 2),
          11.5 - (strokeWidth / 2),
          strokeWidth,
          strokeWidth
        );
        ctx.clip(region, 'evenodd');
      }

      // Drawing snake
      ctx.beginPath();
      ctx.setLineDash([snakeLength, 100]);
      ctx.lineDashOffset = (time * snakeOffsetMul) - snakeLength;
      ctx.moveTo(strokeWidth / 2, 11.5);
      ctx.lineTo(8, 11.5);
      ctx.quadraticCurveTo(11.5, 11.5, 11.5, 8);
      ctx.lineTo(11.5, strokeWidth / 2);
      ctx.stroke();
    }

    if (!withMask && time >= SNAKE_DURATION) {
      // Drawing dot
      ctx.beginPath();
      ctx.setLineDash([0, 100]);
      ctx.lineDashOffset = (time - SNAKE_DURATION) * dotOffsetMul;
      ctx.arc(11.5, 11.5, dotPathRadius, Math.PI, Math.PI * 3 / 2);
      ctx.stroke();
    }
  }
}
