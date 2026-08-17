import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Palette } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: Palette.textMuted,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 20,
          right: 20,
          borderRadius: 20,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: '#262A3C',
          elevation: 8,
          backgroundColor: '#141724',
          height: 64,
          paddingBottom: Platform.OS === 'ios' ? 8 : 10,
          paddingTop: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconPill : undefined}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={20}
                color={focused ? '#FFFFFF' : Palette.textMuted}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="downloads"
        options={{
          title: 'Downloads',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconPill : undefined}>
              <Ionicons
                name={focused ? 'cloud-download' : 'cloud-download-outline'}
                size={20}
                color={focused ? '#FFFFFF' : Palette.textMuted}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconPill : undefined}>
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={20}
                color={focused ? '#FFFFFF' : Palette.textMuted}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconPill : undefined}>
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                size={20}
                color={focused ? '#FFFFFF' : Palette.textMuted}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconPill: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: Palette.primary,
  },
});



