import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../styles/theme';

import DashboardScreen from '../screens/DashboardScreen';
import TradeHistoryScreen from '../screens/TradeHistoryScreen';
import AddTradeScreen from '../screens/AddTradeScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import TradeDetailScreen from '../screens/TradeDetailScreen';
import JournalScreen from '../screens/JournalScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            History:   focused ? 'list' : 'list-outline',
            Analytics: focused ? 'bar-chart' : 'bar-chart-outline',
            Calendar:  focused ? 'calendar' : 'calendar-outline',
            Journal:   focused ? 'journal' : 'journal-outline',
          };
          return (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Ionicons name={icons[route.name]} size={21} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History"   component={TradeHistoryScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Calendar"  component={CalendarScreen} />
      <Tab.Screen name="Journal"   component={JournalScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main"        component={TabNavigator} />
      <Stack.Screen name="AddTrade"    component={AddTradeScreen}    options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="TradeDetail" component={TradeDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Settings"    component={SettingsScreen}    options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bg1,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    height: 70,
  },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  iconContainer: { padding: 4, borderRadius: 8 },
  iconActive: { backgroundColor: Colors.accentGlow },
});
