import type { RootStackScreenProps } from '@/app/navigation/types';
import { AppText } from '@/core/ui/AppText';
import { Screen } from '@/core/ui/Screen';

export function MovieDetailsScreen({ route }: RootStackScreenProps<'MovieDetails'>) {
  return (
    <Screen>
      <AppText variant="title">{route.params.title ?? route.params.movieId}</AppText>
    </Screen>
  );
}
