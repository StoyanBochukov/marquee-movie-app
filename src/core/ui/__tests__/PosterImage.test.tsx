import { fireEvent, render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';

import { PosterImage } from '../PosterImage';

const RESIZED = 'https://m.media-amazon.com/images/M/poster._V1_SX400.jpg';
const ORIGINAL = 'https://m.media-amazon.com/images/M/poster._V1_SX300.jpg';

const imageUri = () => screen.UNSAFE_getByType(Image).props.source.uri;

describe('PosterImage', () => {
  it('retries the original URL when the resized one fails', () => {
    render(<PosterImage uri={RESIZED} fallbackUri={ORIGINAL} title="Ultimate Avengers II" />);
    expect(imageUri()).toBe(RESIZED);

    fireEvent(screen.UNSAFE_getByType(Image), 'error');

    expect(imageUri()).toBe(ORIGINAL);
    expect(screen.queryByText('Ultimate Avengers II')).toBeNull();
  });

  it('shows the titled tile once every source has failed', () => {
    render(<PosterImage uri={RESIZED} fallbackUri={ORIGINAL} title="Ultimate Avengers II" />);

    fireEvent(screen.UNSAFE_getByType(Image), 'error');
    fireEvent(screen.UNSAFE_getByType(Image), 'error');

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.getByText('Ultimate Avengers II')).toBeTruthy();
  });

  it('does not request the same URL twice', () => {
    render(<PosterImage uri={ORIGINAL} fallbackUri={ORIGINAL} title="Toy Story" />);

    fireEvent(screen.UNSAFE_getByType(Image), 'error');

    expect(screen.getByText('Toy Story')).toBeTruthy();
  });

  it('shows the tile without requesting anything when there is no poster', () => {
    render(<PosterImage uri={null} fallbackUri={null} title="Toy Story" />);

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.getByText('Toy Story')).toBeTruthy();
  });
});
