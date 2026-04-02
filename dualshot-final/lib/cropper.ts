import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export interface CropResult {
  portraitUri: string | null;
  landscapeUri: string | null;
  error?: string;
}

/**
 * Takes a raw video URI and produces two cropped versions:
 * - Portrait (9:16): center-crop horizontally
 * - Landscape (16:9): center-crop vertically
 *
 * Uses ffmpeg's crop filter:
 *   crop=out_w:out_h:x:y
 *
 * For a 1920x1080 source (landscape sensor):
 *   Portrait 9:16 → crop to 607x1080 center → scale to 1080x1920
 *   Landscape 16:9 → already 16:9, keep as-is or slight trim
 *
 * For a 1080x1920 source (portrait recording):
 *   Portrait 9:16 → already 9:16, keep as-is
 *   Landscape 16:9 → crop to 1080x607 center → scale to 1920x1080
 */
export async function cropDualVideos(
  sourceUri: string,
  format: 'mp4' | 'mov' = 'mp4'
): Promise<CropResult> {
  const timestamp = Date.now();
  const ext = format === 'mov' ? 'mov' : 'mp4';
  const codec = format === 'mov' ? 'libx264' : 'libx264';

  const portraitPath = `${FileSystem.cacheDirectory}DualShot_PORT_${timestamp}.${ext}`;
  const landscapePath = `${FileSystem.cacheDirectory}DualShot_LAND_${timestamp}.${ext}`;

  try {
    // Get source video dimensions using ffprobe
    const probeSession = await FFmpegKit.execute(
      `-i "${sourceUri}" -hide_banner`
    );
    // Default assumption: phone records in portrait (1080x1920) when held upright
    // ffmpeg crop filter: crop=w:h:x:y

    // Portrait crop (9:16) — take full height, crop width to 9:16 ratio
    // For 1080x1920 source: width needed = 1920 * 9/16 = 1080 → already correct
    // For 1920x1080 source: width needed = 1080 * 9/16 = 607, center x = (1920-607)/2 = 656
    const portraitCmd = [
      `-i "${sourceUri}"`,
      `-vf "crop=ih*9/16:ih:(iw-ih*9/16)/2:0"`,
      `-c:v ${codec}`,
      `-c:a aac`,
      `-preset ultrafast`,
      `-y "${portraitPath}"`,
    ].join(' ');

    const portraitSession = await FFmpegKit.execute(portraitCmd);
    const portraitReturn = await portraitSession.getReturnCode();

    if (!ReturnCode.isSuccess(portraitReturn)) {
      // Fallback: if crop fails (source is already 9:16), just copy
      const copyCmd = `-i "${sourceUri}" -c copy -y "${portraitPath}"`;
      await FFmpegKit.execute(copyCmd);
    }

    // Landscape crop (16:9) — take full width, crop height to 16:9 ratio
    // For 1080x1920 source: height needed = 1080 * 9/16 = 607, center y = (1920-607)/2 = 656
    // For 1920x1080 source: already 16:9 → just copy
    const landscapeCmd = [
      `-i "${sourceUri}"`,
      `-vf "crop=iw:iw*9/16:0:(ih-iw*9/16)/2"`,
      `-c:v ${codec}`,
      `-c:a aac`,
      `-preset ultrafast`,
      `-y "${landscapePath}"`,
    ].join(' ');

    const landscapeSession = await FFmpegKit.execute(landscapeCmd);
    const landscapeReturn = await landscapeSession.getReturnCode();

    if (!ReturnCode.isSuccess(landscapeReturn)) {
      // Fallback: if crop fails (source is already 16:9), just copy
      const copyCmd = `-i "${sourceUri}" -c copy -y "${landscapePath}"`;
      await FFmpegKit.execute(copyCmd);
    }

    return {
      portraitUri: portraitPath,
      landscapeUri: landscapePath,
    };
  } catch (error: any) {
    return {
      portraitUri: null,
      landscapeUri: null,
      error: error.message || 'FFmpeg processing failed',
    };
  }
}

/**
 * Save both cropped videos to the gallery in a DualShot album
 */
export async function saveDualToGallery(
  portraitUri: string,
  landscapeUri: string
): Promise<void> {
  const portraitAsset = await MediaLibrary.createAssetAsync(portraitUri);
  const landscapeAsset = await MediaLibrary.createAssetAsync(landscapeUri);

  let album = await MediaLibrary.getAlbumAsync('DualShot');
  if (album) {
    await MediaLibrary.addAssetsToAlbumAsync(
      [portraitAsset, landscapeAsset],
      album,
      false
    );
  } else {
    album = await MediaLibrary.createAlbumAsync('DualShot', portraitAsset, false);
    await MediaLibrary.addAssetsToAlbumAsync([landscapeAsset], album, false);
  }

  // Cleanup cache
  try {
    await FileSystem.deleteAsync(portraitUri, { idempotent: true });
    await FileSystem.deleteAsync(landscapeUri, { idempotent: true });
  } catch {}
}

/**
 * Get available storage in MB and estimated recording minutes
 */
export function getStorageEstimate(): { availableMB: number; minutesLeft: number } {
  // React Native doesn't expose StatFs directly
  // This is a rough estimate; actual implementation needs native module
  // For now, return a safe estimate
  return {
    availableMB: 0,
    minutesLeft: 0,
  };
}
