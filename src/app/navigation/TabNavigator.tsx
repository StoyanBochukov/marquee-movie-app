import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bookmark, House, Search, type LucideIcon } from 'lucide-react-native';

import { colors } from '@/core/theme';
import { HomeScreen } from '@/features/home';
import { MyListScreen } from '@/features/my-list';
import { SearchScreen } from '@/features/search';

import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcon =
  (Icon: LucideIcon) =>
  ({ color, size }: { color: string; size: number }) =>
    <Icon color={color} size={size} strokeWidth={2} />;

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: tabIcon(House) }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarIcon: tabIcon(Search) }} />
      <Tab.Screen
        name="MyList"
        component={MyListScreen}
        options={{ title: 'My List', tabBarIcon: tabIcon(Bookmark) }}
      />
    </Tab.Navigator>
  );
}
