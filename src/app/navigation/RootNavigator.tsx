import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MovieDetailsScreen } from '@/features/movie-details';
import type { MovieDetails } from '@/features/movies';
import { MyListButton } from '@/features/my-list';

import { useHideSplashWhenReady } from '../hooks/useHideSplashWhenReady';

import { navigationTheme } from './navigationTheme';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList, RootStackScreenProps } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * The app layer composes features: details stays unaware of My List (and vice versa),
 * which keeps the feature graph acyclic.
 */
const renderDetailsActions = (movie: MovieDetails) => <MyListButton movie={movie} />;

function MovieDetailsRoute(props: RootStackScreenProps<'MovieDetails'>) {
  return <MovieDetailsScreen {...props} renderActions={renderDetailsActions} />;
}

export function RootNavigator() {
  const onNavigationReady = useHideSplashWhenReady();

  return (
    <NavigationContainer theme={navigationTheme} onReady={onNavigationReady}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsRoute}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
