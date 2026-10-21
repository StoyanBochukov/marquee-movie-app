import { Check, Plus } from 'lucide-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { Button } from '@/core/ui';
import type { MovieSummary } from '@/features/movies';

import { useIsInMyList, useMyListStore } from '../store/myListStore';

export function MyListButton({
  movie,
  style,
}: {
  movie: MovieSummary;
  style?: StyleProp<ViewStyle>;
}) {
  const isSaved = useIsInMyList(movie.id);
  const toggle = useMyListStore(state => state.toggle);

  return (
    <Button
      label="My List"
      icon={isSaved ? Check : Plus}
      variant="secondary"
      onPress={() => toggle(movie)}
      accessibilityLabel={
        isSaved ? `Remove ${movie.title} from My List` : `Add ${movie.title} to My List`
      }
      style={style}
    />
  );
}
