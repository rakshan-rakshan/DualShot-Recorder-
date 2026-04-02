import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { getStorageInfo } from '@/lib/storage';

export default function CameraScreen() {
  const router = useRouter();

  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [duration, setDuration] = useState(0);
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  const [recordCount, setRecordCount] = useState(0);

  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get storage estimate on mount
  useEffect(() => {
    getStorageInfo().then(({ minutesRemaining }) => {
      setMinutesLeft(minutesRemaining);
    });
  }, [recordCount]);

  // Pulsing red dot
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isRecording]);

  // Duration timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // Request all permissions
  const requestAllPermissions = async () => {
    await requestCameraPermission();
    await requestMicPermission();
    await requestMediaPermission();
  };

  const allPermissionsGranted =
    cameraPermission?.granted && micPermission?.granted && mediaPermission?.granted;

  // Start recording
  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 600 });
      if (video?.uri) {
        // Navigate to preview screen with the recorded video URI
        router.push({ pathname: '/preview', params: { videoUri: video.uri } });
      }
    } catch (err) {
      console.error('Recording error:', err);
      Alert.alert('Error', 'Recording failed. Please try again.');
    }
    setIsRecording(false);
  };

  // Stop recording
  const stopRecording = () => {
    if (!cameraRef.current || !isRecording) return;
    cameraRef.current.stopRecording();
  };

  const toggleCamera = () => {
    if (isRecording) return;
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
    setTorch(false);
  };

  const toggleTorch = () => {
    if (facing !== 'back') return;
    setTorch((t) => !t);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Permission screen ───
  if (!allPermissionsGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.appTitle}>DUALSHOT</Text>
        <Text style={styles.appSubtitle}>Portrait + Landscape. One Take.</Text>
        <Text style={styles.permissionText}>
          Camera, microphone, and gallery access{'\n'}required to record and save videos.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestAllPermissions}>
          <Text style={styles.permissionButtonText}>GRANT ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Camera screen ───
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
        enableTorch={torch}
        videoQuality="1080p"
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          {isRecording ? (
            <View style={styles.recordingIndicator}>
              <Animated.View style={[styles.redDot, { opacity: pulseAnim }]} />
              <Text style={styles.timerText}>{formatDuration(duration)}</Text>
            </View>
          ) : (
            <Text style={styles.logoText}>DUALSHOT</Text>
          )}
        </View>

        <View style={styles.topRight}>
          {minutesLeft !== null && minutesLeft > 0 && (
            <View style={styles.storageBadge}>
              <Text style={styles.storageText}>~{minutesLeft}min left</Text>
            </View>
          )}
          {!isRecording && (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dual crop frame overlays */}
      <View style={styles.frameOverlays}>
        <View style={[styles.portraitFrame, isRecording && styles.frameActive]}>
          <Text style={[styles.frameLabel, isRecording && styles.frameLabelActive]}>9:16</Text>
        </View>
        <View style={[styles.landscapeFrame, isRecording && styles.frameActive]}>
          <Text style={[styles.frameLabel, isRecording && styles.frameLabelActive]}>16:9</Text>
        </View>
      </View>

      {/* Dual badge */}
      <View style={styles.dualBadgeContainer}>
        <View style={styles.dualBadge}>
          <Text style={styles.dualBadgeText}>2x OUTPUT</Text>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {!isRecording && (
          <Text style={styles.modeLabel}>RECORD ONCE · GET BOTH FORMATS</Text>
        )}

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.sideButton, (facing !== 'back' || isRecording) && styles.disabled]}
            onPress={toggleTorch}
            disabled={facing !== 'back' || isRecording}
          >
            <Text style={styles.sideIcon}>{torch ? '⚡' : '🔦'}</Text>
            <Text style={styles.sideLabel}>{torch ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recordButtonOuter}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.7}
          >
            {isRecording ? (
              <View style={styles.stopSquare} />
            ) : (
              <View style={styles.recordCircle} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sideButton, isRecording && styles.disabled]}
            onPress={toggleCamera}
            disabled={isRecording}
          >
            <Text style={styles.sideIcon}>🔄</Text>
            <Text style={styles.sideLabel}>{facing === 'back' ? 'BACK' : 'FRONT'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center' },
  topRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  logoText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 3 },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e63946' },
  timerText: { color: '#fff', fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },

  storageBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  storageText: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  settingsButton: { padding: 4 },
  settingsIcon: { fontSize: 20 },

  frameOverlays: { position: 'absolute', top: 100, right: 16, gap: 8, alignItems: 'flex-end' },
  portraitFrame: {
    width: 32, height: 56, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)', borderRadius: 3,
    justifyContent: 'center', alignItems: 'center',
  },
  landscapeFrame: {
    width: 56, height: 32, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)', borderRadius: 3,
    justifyContent: 'center', alignItems: 'center',
  },
  frameActive: { borderColor: 'rgba(230,57,70,0.7)', backgroundColor: 'rgba(230,57,70,0.08)' },
  frameLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 7, fontWeight: '600' },
  frameLabelActive: { color: 'rgba(230,57,70,0.8)' },

  dualBadgeContainer: { position: 'absolute', top: 100, left: 16 },
  dualBadge: {
    backgroundColor: 'rgba(230,57,70,0.2)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(230,57,70,0.35)',
  },
  dualBadgeText: { color: '#e63946', fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  bottomControls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingBottom: Platform.OS === 'ios' ? 50 : 32, alignItems: 'center',
  },
  modeLabel: {
    color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 1.5, marginBottom: 20,
  },
  controlsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-evenly', width: '100%', paddingHorizontal: 30,
  },

  sideButton: { alignItems: 'center', padding: 12, width: 60 },
  sideIcon: { fontSize: 24 },
  sideLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: 1, marginTop: 4 },
  disabled: { opacity: 0.3 },

  recordButtonOuter: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  recordCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e63946' },
  stopSquare: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#e63946' },

  permissionContainer: {
    flex: 1, backgroundColor: '#000',
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  appTitle: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: 5 },
  appSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8, marginBottom: 40 },
  permissionText: {
    color: 'rgba(255,255,255,0.6)', fontSize: 14,
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
  },
  permissionButtonText: { color: '#000', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
});
