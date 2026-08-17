import * as Haptics from 'expo-haptics';

import { useSettingsStore } from '@/store/settings-store';

export async function lightImpact() {
  if (!useSettingsStore.getState().settings.hapticsEnabled) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function mediumImpact() {
  if (!useSettingsStore.getState().settings.hapticsEnabled) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export async function successNotification() {
  if (!useSettingsStore.getState().settings.hapticsEnabled) return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function errorNotification() {
  if (!useSettingsStore.getState().settings.hapticsEnabled) return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
