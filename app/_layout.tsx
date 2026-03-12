import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { COLORS } from '@/constants';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Caslon3: require('@/assets/fonts/Caslon3.ttf'),
    'Aileron-Regular': require('@/assets/fonts/Aileron-Regular.otf'),
    'Aileron-SemiBold': require('@/assets/fonts/Aileron-SemiBold.otf'),
    'Aileron-Bold': require('@/assets/fonts/Aileron-Bold.otf'),
    'Aileron-Heavy': require('@/assets/fonts/Aileron-Heavy.otf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={COLORS.deepNavy} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="prayer-calendar"
            options={{
              title: 'Prayer Calendar',
              headerStyle: { backgroundColor: COLORS.deepNavy },
              headerTintColor: COLORS.offWhite,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="events/[id]"
            options={{
              title: 'Event Details',
              headerStyle: { backgroundColor: COLORS.deepNavy },
              headerTintColor: COLORS.offWhite,
              headerShadowVisible: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
