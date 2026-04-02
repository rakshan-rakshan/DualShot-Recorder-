import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';

type Resolution = '1080p' | '4k';
type FPS = 24 | 30 | 60;
type Format = 'mp4' | 'mov';

export default function SettingsScreen() {
  const router = useRouter();

  // Settings state (in production, persist with AsyncStorage)
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [fps, setFps] = useState<FPS>(30);
  const [format, setFormat] = useState<Format>('mp4');
  const [isPremium, setIsPremium] = useState(false);

  const handlePremiumFeature = (feature: string) => {
    if (isPremium) return true;
    Alert.alert(
      'Premium Feature',
      `${feature} is available with DualShot Premium ($4.99 one-time).`,
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Upgrade', onPress: () => {
          // In production: trigger in-app purchase
          Alert.alert('Coming soon', 'In-app purchase will be available on the Play Store version.');
        }},
      ]
    );
    return false;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resolution */}
        <Text style={styles.sectionLabel}>RESOLUTION</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[styles.optionButton, resolution === '1080p' && styles.optionActive]}
            onPress={() => setResolution('1080p')}
          >
            <Text style={[styles.optionText, resolution === '1080p' && styles.optionTextActive]}>
              1080p
            </Text>
            <Text style={styles.optionSub}>Full HD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, resolution === '4k' && styles.optionActive]}
            onPress={() => {
              if (handlePremiumFeature('4K recording')) setResolution('4k');
            }}
          >
            <View style={styles.optionHeader}>
              <Text style={[styles.optionText, resolution === '4k' && styles.optionTextActive]}>
                4K
              </Text>
              {!isPremium && <Text style={styles.premiumTag}>PRO</Text>}
            </View>
            <Text style={styles.optionSub}>Ultra HD</Text>
          </TouchableOpacity>
        </View>

        {/* FPS */}
        <Text style={styles.sectionLabel}>FRAME RATE</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[styles.optionButton, styles.optionSmall, fps === 24 && styles.optionActive]}
            onPress={() => {
              if (handlePremiumFeature('24 fps')) setFps(24);
            }}
          >
            <Text style={[styles.optionText, fps === 24 && styles.optionTextActive]}>24</Text>
            <Text style={styles.optionSub}>Cinema</Text>
            {!isPremium && <Text style={styles.premiumTagSmall}>PRO</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, styles.optionSmall, fps === 30 && styles.optionActive]}
            onPress={() => setFps(30)}
          >
            <Text style={[styles.optionText, fps === 30 && styles.optionTextActive]}>30</Text>
            <Text style={styles.optionSub}>Standard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, styles.optionSmall, fps === 60 && styles.optionActive]}
            onPress={() => {
              if (handlePremiumFeature('60 fps')) setFps(60);
            }}
          >
            <Text style={[styles.optionText, fps === 60 && styles.optionTextActive]}>60</Text>
            <Text style={styles.optionSub}>Smooth</Text>
            {!isPremium && <Text style={styles.premiumTagSmall}>PRO</Text>}
          </TouchableOpacity>
        </View>

        {/* Format */}
        <Text style={styles.sectionLabel}>FILE FORMAT</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[styles.optionButton, format === 'mp4' && styles.optionActive]}
            onPress={() => setFormat('mp4')}
          >
            <Text style={[styles.optionText, format === 'mp4' && styles.optionTextActive]}>
              MP4
            </Text>
            <Text style={styles.optionSub}>Universal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, format === 'mov' && styles.optionActive]}
            onPress={() => {
              if (handlePremiumFeature('MOV format')) setFormat('mov');
            }}
          >
            <View style={styles.optionHeader}>
              <Text style={[styles.optionText, format === 'mov' && styles.optionTextActive]}>
                MOV
              </Text>
              {!isPremium && <Text style={styles.premiumTag}>PRO</Text>}
            </View>
            <Text style={styles.optionSub}>Apple/Pro</Text>
          </TouchableOpacity>
        </View>

        {/* Premium upgrade card */}
        {!isPremium && (
          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>DualShot Premium</Text>
            <Text style={styles.premiumPrice}>$4.99 one-time</Text>
            <Text style={styles.premiumDesc}>
              Unlock 4K recording, 24/60 fps, MOV format, and custom aspect ratios.
              No subscriptions ever.
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => Alert.alert('Coming soon', 'Available on Play Store release.')}
            >
              <Text style={styles.upgradeButtonText}>UPGRADE</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutText}>DualShot Recorder v1.0.0</Text>
          <Text style={styles.aboutText}>No ads · No tracking · No accounts</Text>
          <Text style={styles.aboutText}>Your footage stays on your device.</Text>

          <TouchableOpacity
            style={styles.githubLink}
            onPress={() => Linking.openURL('https://github.com/AwinashKassia/dualshot-recorder')}
          >
            <Text style={styles.githubText}>★ Star on GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.donateLink}
            onPress={() => Linking.openURL('https://buymeacoffee.com/rakshan')}
          >
            <Text style={styles.donateText}>☕ Buy me a coffee</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 30,
  },
  backButton: { color: '#fff', fontSize: 16, padding: 4 },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 2 },

  content: { flex: 1, paddingHorizontal: 20 },

  sectionLabel: {
    color: 'rgba(255,255,255,0.4)', fontSize: 11,
    letterSpacing: 2, marginBottom: 12, marginTop: 8,
  },

  optionRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  optionButton: {
    flex: 1, paddingVertical: 16, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center',
  },
  optionSmall: { paddingVertical: 14 },
  optionActive: {
    borderColor: '#e63946', backgroundColor: 'rgba(230,57,70,0.1)',
  },
  optionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  optionText: { color: 'rgba(255,255,255,0.6)', fontSize: 18, fontWeight: '700' },
  optionTextActive: { color: '#fff' },
  optionSub: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2, letterSpacing: 0.5 },

  premiumTag: {
    backgroundColor: 'rgba(230,57,70,0.25)', color: '#e63946',
    fontSize: 8, fontWeight: '800', letterSpacing: 1,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  premiumTagSmall: {
    backgroundColor: 'rgba(230,57,70,0.25)', color: '#e63946',
    fontSize: 7, fontWeight: '800', letterSpacing: 1,
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, marginTop: 4,
  },

  premiumCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(230,57,70,0.3)',
    borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 8,
  },
  premiumTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  premiumPrice: { color: '#e63946', fontSize: 16, fontWeight: '700', marginTop: 4 },
  premiumDesc: {
    color: 'rgba(255,255,255,0.5)', fontSize: 13,
    textAlign: 'center', lineHeight: 20, marginTop: 12, marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: '#e63946', paddingHorizontal: 40,
    paddingVertical: 14, borderRadius: 12,
  },
  upgradeButtonText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1.5 },

  aboutSection: { alignItems: 'center', marginTop: 32, gap: 4 },
  aboutText: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  githubLink: {
    marginTop: 16, paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  githubText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  donateLink: {
    marginTop: 8, paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  donateText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
});
