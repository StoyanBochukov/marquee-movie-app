import type { MovieDetails, MovieSummary } from '@/features/movies';

import { useMyListStore } from '../store/myListStore';

const movie = (id: string): MovieSummary => ({
  id,
  title: `Movie ${id}`,
  year: '2020',
  type: 'movie',
  posterUrl: null,
});

describe('myListStore', () => {
  beforeEach(() => useMyListStore.getState().clear());

  it('toggles titles in and out, newest first', () => {
    const { toggle } = useMyListStore.getState();
    toggle(movie('a'));
    toggle(movie('b'));
    expect(useMyListStore.getState().items.map(item => item.id)).toEqual(['b', 'a']);

    toggle(movie('a'));
    expect(useMyListStore.getState().items.map(item => item.id)).toEqual(['b']);
  });

  it('persists only summary fields when given a full details record', () => {
    const details = { ...movie('c'), plot: 'Long plot', actors: ['Someone'] } as MovieDetails;
    useMyListStore.getState().toggle(details);

    const saved = useMyListStore.getState().items[0];
    expect(saved).toEqual(expect.objectContaining({ id: 'c', title: 'Movie c' }));
    expect(saved).not.toHaveProperty('plot');
    expect(saved?.savedAt).toEqual(expect.any(Number));
  });
});
