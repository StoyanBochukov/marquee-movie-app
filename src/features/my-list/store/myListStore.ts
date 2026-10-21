import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { userStorage } from '@/core/storage/keyValueStorage';
import type { MovieSummary } from '@/features/movies';

export type SavedMovie = MovieSummary & { savedAt: number };

type MyListState = {
  /** Newest first. */
  items: SavedMovie[];
  toggle: (movie: MovieSummary) => void;
  remove: (id: string) => void;
  clear: () => void;
};

/** Store only the summary fields, even when given a full details record. */
const toSaved = ({ id, title, year, type, posterUrl }: MovieSummary): SavedMovie => ({
  id,
  title,
  year,
  type,
  posterUrl,
  savedAt: Date.now(),
});

export const useMyListStore = create<MyListState>()(
  persist(
    set => ({
      items: [],
      toggle: movie =>
        set(state =>
          state.items.some(item => item.id === movie.id)
            ? { items: state.items.filter(item => item.id !== movie.id) }
            : { items: [toSaved(movie), ...state.items] },
        ),
      remove: id => set(state => ({ items: state.items.filter(item => item.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'my-list',
      version: 1,
      storage: createJSONStorage(() => userStorage),
      partialize: state => ({ items: state.items }),
    },
  ),
);

export const useIsInMyList = (id: string) =>
  useMyListStore(state => state.items.some(item => item.id === id));
