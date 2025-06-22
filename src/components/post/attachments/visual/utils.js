export function isGifLike(att) {
  return (
    (att.mediaType === 'video' || att.type === 'video') &&
    (att.meta?.animatedImage || (att.meta?.silent && att.duration <= 10))
  );
}
