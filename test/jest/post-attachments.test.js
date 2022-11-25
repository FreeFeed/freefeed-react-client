/* global describe, it, expect */
import { render } from '@testing-library/react';

import PostAttachments from '../../src/components/post/post-attachments';

const renderPostAttachments = (props = {}) => {
  return render(<PostAttachments {...props} />);
};

describe('PostAttachments', () => {
  it('Renders an empty attachments container', () => {
    const { asFragment } = renderPostAttachments();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Displays all post attachment types', () => {
    const image1 = {
      id: 'im1',
      mediaType: 'image',
      fileName: 'CAT.JPG',
      fileSize: 200000,
      thumbnailUrl: 'https://thumbnail/CAT.JPG',
      url: 'https://media/CAT.JPG',
      imageSizes: {
        t: {
          w: 400,
          h: 300,
        },
        o: {
          w: 2000,
          h: 1500,
        },
      },
    };

    const image2 = {
      id: 'im2',
      mediaType: 'image',
      fileName: 'food.jpg',
      fileSize: 2000,
      thumbnailUrl: 'https://thumbnail/food.jpg',
      url: 'https://media/food.jpg',
      imageSizes: {
        o: {
          w: 2000,
          h: 1500,
        },
      },
    };

    const video1 = {
      id: 'vi1',
      mediaType: 'general',
      fileName: 'sunrise.mp4',
      fileSize: 123456789,
      url: 'https://media/sunrise.mp4',
    };

    const audio1 = {
      id: 'au1',
      mediaType: 'audio',
      fileName: 'wonderwall.mp3',
      artist: 'Oasis',
      title: 'Wonderwall',
      fileSize: 1234567,
      url: 'https://media/wonderwall.mp3',
    };

    const general1 = {
      id: 'ge1',
      mediaType: 'general',
      fileName: 'rfc.pdf',
      fileSize: 50000,
      url: 'https://media/rfc.pdf',
    };

    const { asFragment } = renderPostAttachments({
      attachments: [video1, image1, general1, image2, audio1],
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
