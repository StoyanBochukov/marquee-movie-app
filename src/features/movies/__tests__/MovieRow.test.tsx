import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ApiError } from '@/core/api';

import { omdbService } from '../api/omdbService';
import { MovieRow } from '../components/MovieRow';
import type { MovieSummary, Page } from '../model/types';

jest.mock('../api/omdbService', () => ({
  omdbService: { searchMovies: jest.fn(), getMovieById: jest.fn() },
}));

const searchMovies = omdbService.searchMovies as jest.MockedFunction<
  typeof omdbService.searchMovies
>;

const page = (titles: string[]): Page<MovieSummary> => ({
  items: titles.map((title, index) => ({
    id: `tt${index}`,
    title,
    year: '2001',
    type: 'movie',
    posterUrl: null,
  })),
  page: 1,
  totalResults: titles.length,
  hasNextPage: false,
});

function renderRow(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const result = render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  return { ...result, client };
}

describe('MovieRow', () => {
  afterEach(() => jest.clearAllMocks());

  it('shows a loading state, then the shelf with accessible cards', async () => {
    searchMovies.mockResolvedValue(page(['The Matrix', 'The Matrix Reloaded']));
    const onPressMovie = jest.fn();
    const { client } = renderRow(
      <MovieRow title="Enter the Matrix" query={{ query: 'matrix' }} onPressMovie={onPressMovie} />,
    );

    expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0);

    fireEvent.press(await screen.findByLabelText('The Matrix, 2001'));
    expect(onPressMovie).toHaveBeenCalledWith(expect.objectContaining({ id: 'tt0' }));
    expect(screen.getByText('Enter the Matrix')).toBeTruthy();
    client.clear();
  });

  it('isolates failures behind an inline retry', async () => {
    searchMovies.mockRejectedValueOnce(new ApiError('server'));
    searchMovies.mockResolvedValueOnce(page(['Recovered']));
    const { client } = renderRow(
      <MovieRow title="Flaky" query={{ query: 'flaky' }} onPressMovie={jest.fn()} />,
    );

    fireEvent.press(await screen.findByLabelText('Retry'));
    expect(await screen.findByLabelText('Recovered, 2001')).toBeTruthy();
    client.clear();
  });

  it('hides itself when the search has no displayable results', async () => {
    searchMovies.mockResolvedValue(page(['Only One']));
    const { client } = renderRow(
      <MovieRow
        title="Excluded"
        query={{ query: 'one' }}
        excludeIds={['tt0']}
        onPressMovie={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.queryByText('Excluded')).toBeNull());
    expect(searchMovies).toHaveBeenCalledTimes(1);
    client.clear();
  });
});
