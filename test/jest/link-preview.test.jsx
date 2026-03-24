/* global describe, it, expect, vi */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import cachedFetch from '../../src/components/link-preview/helpers/cached-fetch';
import LinkPreview from '../../src/components/link-preview/preview';
import { StateProvider } from './state-provider';

vi.mock('../../src/components/link-preview/helpers/cached-fetch');

const renderLinkPreview = (props = {}) => {
  const defaultProps = { allowEmbedly: false };
  const state = { routeLoadingState: false };
  return render(
    <StateProvider state={state}>
      <LinkPreview {...defaultProps} {...props} />
    </StateProvider>,
  );
};

describe('LinkPreview', () => {
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
    const script = document.createElement('script');
    document.body.appendChild(script);
    const { asFragment } = renderLinkPreview({ url: 'https://example.com', allowEmbedly: true });
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a video preview for Youtube', async () => {
    cachedFetch.mockResolvedValue({
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      author_name: 'Rick Astley',
      author_url: 'https://www.youtube.com/@RickAstleyYT',
      type: 'video',
      height: 113,
      width: 200,
      version: '1.0',
      provider_name: 'YouTube',
      provider_url: 'https://www.youtube.com/',
      thumbnail_height: 360,
      thumbnail_width: 480,
      thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      html: '<iframe width="200" height="113" src="https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="Rick Astley - Never Gonna Give You Up (Official Music Video)"></iframe>',
    });

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

  it('Shows a FreeFeed post preview with short ID', () => {
    const state = {
      routeLoadingState: false,
      user: {
        id: 'viewer-id',
        username: 'viewer',
        frontendPreferences: {
          displayNames: {},
          timeDisplay: {},
        },
      },
      postPreviewStatuses: {
        abc123: { loading: false, success: true, error: false },
      },
      postPreviewsData: {
        abc123: {
          id: '12345678-1234-4123-8123-123456789abc',
          body: 'This is a test post with some text content',
          createdBy: 'user1',
        },
      },
      users: {
        user1: {
          id: 'user1',
          username: 'testuser',
          screenName: 'Test User',
          profilePictureMediumUrl: 'https://example.com/avatar.jpg',
        },
      },
    };

    const { asFragment } = render(
      <StateProvider state={state}>
        <LinkPreview allowEmbedly={false} url="https://freefeed.net/testuser/abc123" />
      </StateProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows a FreeFeed post preview with UUID', () => {
    const state = {
      routeLoadingState: false,
      user: {
        id: 'viewer-id',
        username: 'viewer',
        frontendPreferences: {
          displayNames: {},
          timeDisplay: {},
        },
      },
      postPreviewStatuses: {
        '12345678-1234-4123-8123-123456789abc': { loading: false, success: true, error: false },
      },
      postPreviewsData: {
        '12345678-1234-4123-8123-123456789abc': {
          id: '12345678-1234-4123-8123-123456789abc',
          body: 'Another test post with UUID format',
          createdBy: 'user2',
        },
      },
      users: {
        user2: {
          id: 'user2',
          username: 'anotheruser',
          screenName: 'Another User',
          profilePictureMediumUrl: 'https://example.com/avatar2.jpg',
        },
      },
    };

    const { asFragment } = render(
      <StateProvider state={state}>
        <LinkPreview
          allowEmbedly={false}
          url="https://freefeed.net/anotheruser/12345678-1234-4123-8123-123456789abc"
        />
      </StateProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows loading state for FreeFeed post preview', () => {
    const state = {
      routeLoadingState: false,
      postPreviewStatuses: {
        def456: { loading: true, success: false, error: false },
      },
      postPreviewsData: {},
      users: {},
    };

    const { asFragment } = render(
      <StateProvider state={state}>
        <LinkPreview allowEmbedly={false} url="https://freefeed.net/someuser/def456" />
      </StateProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows error state for unavailable FreeFeed post', () => {
    const state = {
      routeLoadingState: false,
      postPreviewStatuses: {
        xyz789: { loading: false, success: false, error: true },
      },
      postPreviewsData: {},
      users: {},
    };

    const { asFragment } = render(
      <StateProvider state={state}>
        <LinkPreview allowEmbedly={false} url="https://freefeed.net/someuser/xyz789" />
      </StateProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows FreeFeed post preview with long text', () => {
    const longText =
      'This is a very long post that should be truncated. '.repeat(20) +
      'This text should not be visible in the preview because it exceeds the maximum length.';

    const state = {
      routeLoadingState: false,
      user: {
        id: 'viewer-id',
        username: 'viewer',
        frontendPreferences: {
          displayNames: {},
          timeDisplay: {},
        },
      },
      postPreviewStatuses: {
        long123: { loading: false, success: true, error: false },
      },
      postPreviewsData: {
        long123: {
          id: '12345678-1234-4123-8123-123456789abc',
          body: longText,
          createdBy: 'user3',
        },
      },
      users: {
        user3: {
          id: 'user3',
          username: 'longpostuser',
          screenName: 'Long Post User',
          profilePictureMediumUrl: 'https://example.com/avatar3.jpg',
        },
      },
    };

    const { asFragment } = render(
      <StateProvider state={state}>
        <LinkPreview allowEmbedly={false} url="https://freefeed.net/longpostuser/long123" />
      </StateProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("Doesn't show a preview for FreeFeed post comment link", () => {
    const { asFragment } = renderLinkPreview({
      url: 'https://freefeed.net/testuser/abc123#comment-xyz',
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
