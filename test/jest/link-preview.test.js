/* global describe, it, expect, jest, beforeEach */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as reactRedux from 'react-redux';

import cachedFetch from '../../src/components/link-preview/cached-fetch';
import LinkPreview from '../../src/components/link-preview/preview';

jest.mock('../../src/components/link-preview/cached-fetch');

const renderLinkPreview = (props = {}) => {
  const defaultProps = { allowEmbedly: false };
  return render(<LinkPreview {...defaultProps} {...props} />);
};

describe('LinkPreview', () => {
  const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');

  beforeEach(() => {
    useSelectorMock.mockClear();
  });

  it("Doesn't show a preview for freefeed.net", () => {
    const { asFragment } = renderLinkPreview({ url: 'https://freefeed.net/support' });
    expect(asFragment()).toMatchSnapshot();
  });

  it("Doesn't show a preview for reddit.com", () => {
    const { asFragment } = renderLinkPreview({ url: 'https://reddit.com/r/pics' });
    expect(asFragment()).toMatchSnapshot();
  });

  it("Doesn't show a preview for some random website", () => {
    const { asFragment } = renderLinkPreview({ url: 'https://example.com' });
    expect(asFragment()).toMatchSnapshot();
  });

  it('Does show an Embedly preview for some random website if embedly is allowed', () => {
    useSelectorMock.mockReturnValue(false);
    const script = document.createElement('script');
    document.body.appendChild(script);
    const { asFragment } = renderLinkPreview({ url: 'https://example.com', allowEmbedly: true });
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a video preview for Youtube', async () => {
    useSelectorMock.mockReturnValue(false);

    const { asFragment } = renderLinkPreview({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123',
    });

    await waitFor(() => screen.findByLabelText('Video preview'));
    expect(asFragment()).toMatchSnapshot();

    fireEvent.click(screen.getByLabelText('Video preview'));
    await waitFor(() => screen.getByLabelText('Video player'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a video preview for Vimeo', async () => {
    useSelectorMock.mockReturnValue(false);
    cachedFetch.mockResolvedValue({
      title: 'Allir \u00FAr!',
      author_name: 'Novaisland',
      width: 426,
      height: 240,
      thumbnail_url: 'https://i.vimeocdn.com/video/988324592_295x166.jpg',
    });

    const { asFragment } = renderLinkPreview({
      url: 'https://vimeo.com/475544342',
    });

    await waitFor(() => screen.findByLabelText('Video preview'));
    expect(asFragment()).toMatchSnapshot();
  });

  it("Doesn't show a video preview if network request has failed", async () => {
    useSelectorMock.mockReturnValue(false);
    cachedFetch.mockResolvedValue({
      error: `HTTP error: 404 Not Found`,
    });

    const { asFragment } = renderLinkPreview({
      url: 'https://vimeo.com/475544342',
    });

    await waitFor(() => screen.findByLabelText('Video preview'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a video preview for Coub', async () => {
    useSelectorMock.mockReturnValue(false);
    cachedFetch.mockResolvedValue({
      title: 'Russian Duck Army',
      author_name: 'Cat in chief',
      width: '640',
      height: '360',
      thumbnail_url:
        'https://coub-anubis-a.akamaized.net/coub_storage/coub/simple/cw_image/ce289137929/a46bb680bae77df60147a/1441008976_00029.jpg',
    });

    const { asFragment } = renderLinkPreview({
      url: 'https://coub.com/view/7xk9n',
    });

    await waitFor(() => screen.findByLabelText('Video preview'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a video preview for Gfycat', async () => {
    useSelectorMock.mockReturnValue(false);
    cachedFetch.mockResolvedValue({
      gfyItem: {
        height: 570,
        mobilePosterUrl: 'https://thumbs.gfycat.com/DismalIndolentGalago-mobile.jpg',
        mobileUrl: 'https://thumbs.gfycat.com/DismalIndolentGalago-mobile.mp4',
        title: 'Cat has found the squishiest face to knead',
        width: 640,
      },
    });

    const { asFragment } = renderLinkPreview({
      url: 'https://gfycat.com/dismalindolentgalago-dog',
    });

    await waitFor(() => screen.findByLabelText('Video preview'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a video preview for Giphy', async () => {
    useSelectorMock.mockReturnValue(false);
    cachedFetch.mockResolvedValue({
      author_name: 'The Tonight Show Starring Jimmy Fallon',
      title:
        'Jimmy Fallon Christmas GIF by The Tonight Show Starring Jimmy Fallon - Find & Share on GIPHY',
      height: 357,
      media_url: 'https://media3.giphy.com/media/ncAcktdglyCuVrKeZG/giphy.gif',
      width: 500,
    });

    const { asFragment } = renderLinkPreview({
      url: 'https://giphy.com/gifs/fallontonight-jimmy-fallon-tonight-show-ncAcktdglyCuVrKeZG',
    });

    await waitFor(() => screen.findByLabelText('Video preview'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a Twitter preview', () => {
    const { asFragment } = renderLinkPreview({
      url: 'https://twitter.com/elonmusk/status/1368867769211514881?s=20',
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows an Instagram preview', () => {
    const { asFragment } = renderLinkPreview({
      url: 'https://www.instagram.com/p/CMH88yIDA-J/',
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a Google Docs preview', () => {
    const { asFragment } = renderLinkPreview({
      url: 'https://docs.google.com/document/d/1GbH0-Tc0Rs-T18JRA3Y--uOo_-lzzzTiCbYCHvs6K_4/edit?usp=sharing',
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a Yandex Music preview', () => {
    const { asFragment } = renderLinkPreview({
      url: 'https://music.yandex.ru/album/12970824',
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a Wikipedia preview', async () => {
    cachedFetch.mockResolvedValue({
      thumbnail: {
        source:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Antonio_canova%2C_amore_e_psiche_louvre_06.JPG/320px-Antonio_canova%2C_amore_e_psiche_louvre_06.JPG',
        width: 320,
        height: 240,
      },
      title: 'Ягодицы',
      extract:
        'Я́годи́цы — мягкие ткани задней и латеральных поверхностей таза, представленные ягодичными мышцами, подкожной клетчаткой и кожей. Каждая ягодица ограничена сверху областью пояснично-крестцового ромба (Михаэлиса) и крылом подвздошной кости, снизу — подъягодичной складкой и промежностью, а сбоку — областью большого вертела бедра.',
    });

    const { asFragment } = renderLinkPreview({
      url: 'https://ru.wikipedia.org/wiki/%D0%AF%D0%B3%D0%BE%D0%B4%D0%B8%D1%86%D1%8B',
    });

    await waitFor(() => screen.findByAltText('Ягодицы'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a Telegram preview', () => {
    const { asFragment } = renderLinkPreview({
      url: 'https://t.me/meowdobot/0000',
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a Tiktok preview', async () => {
    cachedFetch.mockResolvedValue({
      title:
        'The Wellerman. #seashanty #sea #shanty #viral #singing #acoustic #pirate #new #original #fyp #foryou #foryoupage #singer #scottishsinger #scottish',
      author_name: 'N A T H A N E V A N S S',
    });

    const { asFragment } = renderLinkPreview({
      url: 'https://www.tiktok.com/@nathanevanss/video/6910995345421962498',
    });

    await waitFor(() => screen.findByLabelText('TikTok preview'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a Soundcloud preview', async () => {
    cachedFetch.mockResolvedValue({
      title: 'In Dub We Trust by SmokedPepper',
      html: '<iframe width="100%" height="400" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F966875497&show_artwork=true"></iframe>',
    });

    const { asFragment } = renderLinkPreview({
      url: 'https://soundcloud.com/smokedpepper/in-dub-we-trust',
    });

    await waitFor(() => screen.findByText('In Dub We Trust by SmokedPepper at SoundCloud'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a Spotify preview', () => {
    const { asFragment } = renderLinkPreview({
      url: 'https://open.spotify.com/playlist/2FNRtMSaxdxVb6ZPFhXgrJ?si=kJX6mLFtT6eiGSZtYm8oDQ',
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows an Apple Music preview', () => {
    const { asFragment } = renderLinkPreview({
      url: 'https://music.apple.com/ru/album/dont-ask-me-why/1441018520?i=1441018529&l=en',
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
