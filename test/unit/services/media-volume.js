/* global describe, it, beforeEach, afterEach */
import expect from 'unexpected';
import { bindMediaVolume } from '../../../src/services/media-volume';

const storageKeys = ['audio-volume', 'video-volume'];

describe('media volume', () => {
  beforeEach(() => storageKeys.forEach((key) => localStorage.removeItem(key)));
  afterEach(() => storageKeys.forEach((key) => localStorage.removeItem(key)));

  it('restores separate audio and video volumes', () => {
    localStorage.setItem('audio-volume', '0.25');
    localStorage.setItem('video-volume', '0.75');
    const audio = document.createElement('audio');
    const video = document.createElement('video');

    bindMediaVolume(audio);
    bindMediaVolume(video);

    expect(audio.volume, 'to be', 0.25);
    expect(video.volume, 'to be', 0.75);
  });

  it('restores zero volume', () => {
    localStorage.setItem('audio-volume', '0');
    const audio = document.createElement('audio');

    bindMediaVolume(audio);

    expect(audio.volume, 'to be', 0);
  });

  it.each(['', 'invalid', '-0.1', '1.1'])('ignores invalid volume %j', (storedVolume) => {
    localStorage.setItem('audio-volume', storedVolume);
    const audio = document.createElement('audio');

    bindMediaVolume(audio);

    expect(audio.volume, 'to be', 1);
  });

  it('saves volume changes', () => {
    const audio = document.createElement('audio');
    const unbind = bindMediaVolume(audio);

    audio.volume = 0.65;
    audio.dispatchEvent(new Event('volumechange'));

    expect(localStorage.getItem('audio-volume'), 'to be', '0.65');
    expect(localStorage.getItem('video-volume'), 'to be null');
    unbind();
  });

  it('stops saving after unbinding', () => {
    const audio = document.createElement('audio');
    const unbind = bindMediaVolume(audio);
    unbind();

    audio.volume = 0.65;
    audio.dispatchEvent(new Event('volumechange'));

    expect(localStorage.getItem('audio-volume'), 'to be null');
  });
});
