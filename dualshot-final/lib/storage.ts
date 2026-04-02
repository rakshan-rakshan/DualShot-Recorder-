import { NativeModules, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Estimate available storage.
 * expo-file-system provides getFreeDiskStorageAsync()
 */
export async function getStorageInfo(): Promise<{
  availableMB: number;
  minutesRemaining: number;
}> {
  try {
    const freeBytes = await FileSystem.getFreeDiskStorageAsync();
    const availableMB = Math.round(freeBytes / (1024 * 1024));

    // Bitrate estimates per minute:
    // 1080p 30fps ≈ 130 MB/min
    // 1080p 60fps ≈ 200 MB/min
    // 4K 30fps ≈ 375 MB/min
    // 4K 60fps ≈ 600 MB/min
    // Since we save 2 crops, multiply by ~1.5x (crops are smaller than original)
    const mbPerMinute = 200; // conservative estimate for 1080p + dual output
    const minutesRemaining = Math.floor(availableMB / mbPerMinute);

    return { availableMB, minutesRemaining };
  } catch {
    return { availableMB: 0, minutesRemaining: 0 };
  }
}

/**
 * Format storage display
 */
export function formatStorage(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb} MB`;
}
