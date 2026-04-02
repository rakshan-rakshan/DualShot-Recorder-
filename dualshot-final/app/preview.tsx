import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function PreviewScreen() {
  const router = useRouter();
  const { videoUri } = useLocalSearchParams<{ videoUri: string }>();

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!videoUri) return;
    setIsSaving(true);

    try {
      // In dev build with ffmpeg: this would call cropDualVideos()
      // For now (and as fallback): save two copies to gallery
      const portraitAsset = await MediaLibrary.createAssetAsync(videoUri);
      let album = await MediaLibrary.getAlbumAsync('DualShot');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([portraitAsset], album, false);
      } else {
        album = await MediaLibrary.createAlbumAsync('DualShot', portraitAsset, false);
      }

      // Second copy
      const landscapeAsset = await MediaLibrary.createAssetAsync(videoUri);
      await MediaLibrary.addAssetsToAlbumAsync([landscapeAsset], album, false);

      setSaved(true);
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Could not save videos.');
    }
    setIsSaving(false);
  };

  const handleDiscard = () => {
    Alert.alert('Discard recording?', 'This video will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  if (!videoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No video to preview</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={styles.headerButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PREVIEW</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Side-by-side preview */}
      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>Your dual outputs</Text>

        <View style={styles.previewRow}>
          {/* Portrait preview */}
          <View style={styles.previewCard}>
            <View style={[styles.previewFrame, styles.portraitPreview]}>
              <View style={styles.videoPlaceholder}>
                <Text style={styles.ratioText}>9:16</Text>
                <Text style={styles.useText}>Reels · TikTok</Text>
              </View>
            </View>
            <Text style={styles.previewLabel}>Portrait</Text>
          </View>

          {/* Landscape preview */}
          <View style={styles.previewCard}>
            <View style={[styles.previewFrame, styles.landscapePreview]}>
              <View style={styles.videoPlaceholder}>
                <Text style={styles.ratioText}>16:9</Text>
                <Text style={styles.useText}>YouTube</Text>
              </View>
            </View>
            <Text style={styles.previewLabel}>Landscape</Text>
          </View>
        </View>

        {/* Full video preview */}
        <View style={styles.fullPreview}>
          <Text style={styles.fullPreviewLabel}>Original recording</Text>
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: videoUri }}
              style={styles.video}
              useNativeControls
              isLooping
              resizeMode={ResizeMode.CONTAIN}
            />
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {saved ? (
          <View style={styles.savedContainer}>
            <Text style={styles.savedText}>✓ Saved to DualShot album</Text>
            <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>RECORD ANOTHER</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
              <Text style={styles.discardButtonText}>DISCARD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.disabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>SAVE BOTH</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#000',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 24,
  },
  headerButton: { color: '#fff', fontSize: 22, padding: 8 },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 2 },

  previewSection: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)', fontSize: 12,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16,
  },

  previewRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 24,
  },
  previewCard: { flex: 1, alignItems: 'center' },
  previewFrame: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  portraitPreview: { width: PREVIEW_WIDTH, height: PREVIEW_WIDTH * (16 / 9) * 0.5 },
  landscapePreview: { width: PREVIEW_WIDTH, height: PREVIEW_WIDTH * (9 / 16) * 1.2 },

  videoPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  ratioText: { color: 'rgba(255,255,255,0.6)', fontSize: 18, fontWeight: '700' },
  useText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 4, letterSpacing: 1 },
  previewLabel: {
    color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8, fontWeight: '600',
  },

  fullPreview: { flex: 1 },
  fullPreviewLabel: {
    color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 1, marginBottom: 8,
  },
  videoContainer: {
    flex: 1, borderRadius: 12, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)', maxHeight: 240,
  },
  video: { flex: 1 },

  actions: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16,
  },
  buttonRow: { flexDirection: 'row', gap: 12 },
  discardButton: {
    flex: 1, paddingVertical: 16, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  discardButtonText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 },
  saveButton: {
    flex: 2, paddingVertical: 16, borderRadius: 12,
    backgroundColor: '#fff', alignItems: 'center',
  },
  saveButtonText: { color: '#000', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  disabled: { opacity: 0.5 },

  savedContainer: { alignItems: 'center', gap: 16 },
  savedText: { color: '#4ade80', fontSize: 16, fontWeight: '600' },
  doneButton: {
    width: '100%', paddingVertical: 16, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center',
  },
  doneButtonText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },

  errorText: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 100 },
  linkText: { color: '#60a5fa', fontSize: 14, textAlign: 'center', marginTop: 12 },
});
