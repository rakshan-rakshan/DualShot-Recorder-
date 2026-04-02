# DualShot Recorder

**Record once. Get portrait + landscape. One take.**

DualShot records video from your phone's camera and automatically produces two outputs — a 9:16 portrait crop (for Reels, TikTok, Shorts) and a 16:9 landscape crop (for YouTube, presentations) — from a single recording.

No ads. No tracking. No accounts. Your footage stays on your device.

---

## Features

**Free:**
- Real-time camera preview with recording controls
- Automatic dual-crop: 9:16 portrait + 16:9 landscape from one take
- Side-by-side preview before saving
- Front/back camera toggle
- Torch/flashlight control
- 1080p recording at 30fps
- MP4 output format
- Storage estimate display
- Saves to a dedicated DualShot album in your gallery

**Premium ($4.99 one-time):**
- 4K Ultra HD recording
- 24fps (cinematic) and 60fps (smooth) options
- MOV file format support
- Custom aspect ratios (1:1, 4:5, 21:9)

---

## Install

### From Play Store
[Coming soon]

### Build from source

Requirements: Node.js 18+, npm, Expo account (free)

```bash
# Clone
git clone https://github.com/AwinashKassia/dualshot-recorder.git
cd dualshot-recorder

# Install dependencies
npm install

# Run in Expo Go (limited — no ffmpeg cropping)
npx expo start

# Build dev APK (full features, needs Expo account)
npm install -g eas-cli
eas login
eas build --profile development --platform android

# Build production AAB for Play Store
eas build --profile production --platform android
```

---

## Tech Stack

- **Expo** (React Native) with expo-router
- **expo-camera** for recording
- **ffmpeg-kit-react-native** for video cropping
- **expo-media-library** for gallery saving
- **TypeScript** throughout
- No backend, no analytics, no data collection

---

## Project Structure

```
app/
├── _layout.tsx       # Root layout (Stack navigator)
├── index.tsx         # Camera screen (recording UI)
├── preview.tsx       # Side-by-side crop preview
└── settings.tsx      # Resolution, FPS, format settings
lib/
├── cropper.ts        # FFmpeg dual-crop logic
├── settings.tsx      # Settings context provider
└── storage.ts        # Storage estimation utility
```

---

## How It Works

1. You record a video using the camera
2. After stopping, DualShot runs two FFmpeg crop passes:
   - **Portrait (9:16):** `crop=ih*9/16:ih` — takes full height, center-crops width
   - **Landscape (16:9):** `crop=iw:iw*9/16` — takes full width, center-crops height
3. Both cropped files are saved to your gallery in a "DualShot" album
4. You preview both crops side-by-side before saving

---

## Contributing

PRs welcome. Please keep it simple — this app does one thing well.

1. Fork the repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit (`git commit -m 'feat: add my feature'`)
4. Push (`git push origin feature/my-feature`)
5. Open a PR

---

## Support the Project

If DualShot saves you time, consider:

- ⭐ **Star this repo** — helps others find it
- ☕ **[Buy me a coffee](https://buymeacoffee.com/rakshan)** — fuels development
- 💬 **Share feedback** — open an issue or discussion

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built by [Rakshan](https://github.com/AwinashKassia)
