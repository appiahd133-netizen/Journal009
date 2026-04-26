import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TradeProvider } from './src/context/TradeContext';
import RootNavigator from './src/navigation/RootNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoadingScreen from './src/components/LoadingScreen';
import ErrorBoundary from './src/components/ErrorBoundary';

const ONBOARDING_KEY = '@forex_journal_onboarded';

export default function App() {
  const [appState, setAppState] = useState('loading'); // 'loading' | 'onboarding' | 'ready'

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_KEY);
      setAppState(val === 'true' ? 'ready' : 'onboarding');
    } catch {
      setAppState('ready'); // fail open
    }
  };

  const handleOnboardingDone = () => setAppState('ready');

  if (appState === 'loading') return <LoadingScreen />;
  if (appState === 'onboarding') return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <OnboardingScreen onDone={handleOnboardingDone} />
    </SafeAreaProvider>
  );

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <TradeProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </TradeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
