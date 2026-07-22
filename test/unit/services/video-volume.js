/* global describe, it, beforeEach, afterEach */
import expect from 'unexpected';
import { bindVideoVolume } from '../../../src/services/video-volume';

const storageKey = 'video-volume';

describe('video volume', () => {
  beforeEach(() => localStorage.removeItem(storageKey));
  afterEach(() => localStorage.removeItem(storageKey));

  it('restores the stored volume', () => {
    localStorage.setItem(storageKey, '0.35');
    const video = document.createElement('video');

    bindVideoVolume(video);

    expect(video.volume, 'to be', 0.35);
  });

  it('restores zero volume', () => {
    localStorage.setItem(storageKey, '0');
    const video = document.createElement('video');

    bindVideoVolume(video);

    expect(video.volume, 'to be', 0);
  });

  it.each(['', 'invalid', '-0.1', '1.1'])('ignores invalid volume %j', (storedVolume) => {
    localStorage.setItem(storageKey, storedVolume);
    const video = document.createElement('video');

    bindVideoVolume(video);

    expect(video.volume, 'to be', 1);
  });

  it('saves volume changes', () => {
    const video = document.createElement('video');
    const unbind = bindVideoVolume(video);

    video.volume = 0.65;
    video.dispatchEvent(new Event('volumechange'));

    expect(localStorage.getItem(storageKey), 'to be', '0.65');
    unbind();
  });

  it('stops saving after unbinding', () => {
    const video = document.createElement('video');
    const unbind = bindVideoVolume(video);
    unbind();

    video.volume = 0.65;
    video.dispatchEvent(new Event('volumechange'));

    expect(localStorage.getItem(storageKey), 'to be null');
  });
});
