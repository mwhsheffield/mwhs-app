import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';

import { COLORS } from '@/constants';

export default function TabLayout() {
  return (
    <ThemeProvider
      value={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: COLORS.offWhite,
          card: COLORS.deepNavy,
          primary: COLORS.steelBlue,
          text: COLORS.offWhite,
          border: COLORS.deepNavy,
        },
      }}
    >
      <NativeTabs
        backgroundColor={COLORS.deepNavy}
        iconColor={COLORS.steelBlue}
        tintColor={COLORS.offWhite}
        labelStyle={{
          color: COLORS.offWhite,
          fontSize: 12,
        }}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Prayer</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="moon.stars.fill" md="schedule" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="events">
          <NativeTabs.Trigger.Icon sf="calendar" md="event" />
          <NativeTabs.Trigger.Label>Events</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
