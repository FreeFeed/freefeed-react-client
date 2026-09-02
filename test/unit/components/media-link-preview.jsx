/* global describe, it, expect, vi */
import { fireEvent, render, waitFor } from '@testing-library/react';

import cachedFetch from '../../../src/components/link-preview/helpers/cached-fetch';
import { MediaLinkPreview } from '../../../src/components/media-links/media-link-preview';
import { MediaLinksProvider } from '../../../src/components/media-links/provider';
import { openLightbox } from '../../../src/services/lightbox';
import { StateProvider } from '../../jest/state-provider';

vi.mock('../../../src/components/link-preview/helpers/cached-fetch');
vi.mock('../../../src/services/lightbox');

describe('MediaLinkPreview', () => {
  it('resolves a Wikimedia Commons file page to thumbnail and original URLs', async () => {
    cachedFetch.mockResolvedValue({
      query: {
        pages: [
          {
            imageinfo: [
              {
                width: 1024,
                height: 838,
                thumburl:
                  'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Grekov_trubachi.jpg/250px-Grekov_trubachi.jpg?utm_source=commons.wikimedia.org',
                url: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Grekov_trubachi.jpg?utm_source=commons.wikimedia.org',
              },
            ],
          },
        ],
      },
    });

    const { container } = render(
      <StateProvider state={{ showHDRImages: false }}>
        <MediaLinksProvider>
          <MediaLinkPreview href="https://commons.wikimedia.org/wiki/File:Grekov_trubachi.jpg" />
        </MediaLinksProvider>
      </StateProvider>,
    );

    await waitFor(() => expect(container.querySelector('img')).not.toBeNull());
    const preview = container.querySelector('img');
    expect(preview).toHaveAttribute(
      'src',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Grekov_trubachi.jpg/250px-Grekov_trubachi.jpg',
    );

    fireEvent.click(preview);
    await waitFor(() => expect(openLightbox).toHaveBeenCalled());
    expect(openLightbox.mock.calls[0][1][0]).toMatchObject({
      src: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Grekov_trubachi.jpg',
      msrc: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Grekov_trubachi.jpg/250px-Grekov_trubachi.jpg',
    });
  });

  it('ignores other Wikimedia Commons file types', () => {
    const { container } = render(
      <StateProvider state={{ showHDRImages: false }}>
        <MediaLinksProvider>
          <MediaLinkPreview href="https://commons.wikimedia.org/wiki/File:Example.svg" />
        </MediaLinksProvider>
      </StateProvider>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(cachedFetch).not.toHaveBeenCalled();
  });
});
