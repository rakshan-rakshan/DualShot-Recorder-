[DualShot-README.md](https://github.com/user-attachments/files/26445945/DualShot-README.md)
# DualShot Recorder

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Android](https://img.shields.io/badge/Platform-Android-brightgreen.svg)](https://play.google.com/store)
[![Built with: Expo](https://img.shields.io/badge/Built%20with-Expo-000.svg)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)

**Record once. Get portrait + landscape. One take.**

Transform a single video recording into two optimized formats — portrait for social media, landscape for presentations — automatically.

[Features](#features) • [Install](#install) • [Usage](#usage) • [Tech Stack](#tech-stack) • [Contributing](#contributing)

</div>

---

## 🎬 What is DualShot?

DualShot Recorder is a lightweight, privacy-first mobile app that solves a universal problem: you record a video, but it's only optimized for one format. DualShot fixes that.

**In one take**, you get:
- 📱 **9:16 portrait crop** — ready for Instagram Reels, TikTok, YouTube Shorts
- 🎥 **16:9 landscape crop** — perfect for YouTube, presentations, monitor playback

**No cloud. No ads. No tracking.** Your footage stays on your device.

---

## ✨ Features

### 🆓 Free Tier
- ✅ Real-time camera preview with intuitive recording controls
- ✅ Automatic dual-crop processing (portrait 9:16 + landscape 16:9)
- ✅ Side-by-side preview before saving
- ✅ Front/back camera toggle
- ✅ Torch/flashlight control
- ✅ 1080p recording @ 30fps
- ✅ MP4 output format
- ✅ Storage estimate display
- ✅ Automatic gallery album organization

### 🌟 Premium ($4.99 one-time)
- 🎬 **4K Ultra HD recording**
- 🎞️ **Multiple frame rates:** 24fps (cinematic), 60fps (smooth)
- 📦 **MOV format support** (professional workflows)
- 🎨 **Custom aspect ratios:** 1:1 (square), 4:5 (Instagram), 21:9 (ultrawide)
- 🔓 **Future features** (free with purchase)

---

## 📦 Install

### From Google Play Store
[Coming soon — currently in beta]

### Build from Source

**Requirements:**
- Node.js 18+
- npm 9+
- Expo account (free at [expo.dev](https://expo.dev))
- Android SDK (for building APK/AAB)

**Setup:**

```bash
# Clone the repository
git clone https://github.com/rakshan-rakshan/DualShot-Recorder-.git
cd DualShot-Recorder-

# Install dependencies
npm install

# Install EAS CLI globally
npm install -g eas-cli

# Authenticate with Expo
eas login
```

**Run Development Version:**

```bash
# Start Expo dev server (preview on phone via Expo Go app)
npx expo start

# Scan QR code with your Android phone
# App will load in Expo Go (limited — no FFmpeg video cropping)
```

**Build Development APK (full features):**

```bash
# Requires EAS account
eas build --profile development --platform android

# APK will be available for download after ~10-15 minutes
# Install directly on your phone
```

**Build Production AAB for Play Store:**

```bash
# Creates optimized Android App Bundle for Google Play
eas build --profile production --platform android

# Upload to Google Play Console
```

---

## 🚀 Usage

### Recording

1. **Open DualShot** — camera screen loads with live preview
2. **Adjust settings** (optional):
   - Tap **⚙️ Settings** → Choose resolution (1080p or 4K), FPS (24/30/60), format (MP4/MOV)
   - Tap **🔦** to toggle flashlight
   - Tap **🔄** to switch front/back camera
3. **Press record** — red circle button starts recording
4. **Press stop** — red circle button stops; FFmpeg processes both crops
5. **Preview both formats** — swipe or tap to compare portrait/landscape
6. **Save** — both crops saved to "DualShot" album in your gallery

### File Organization

- **Album:** "DualShot Recorder"
- **File naming:** `DualShot_[timestamp]_portrait.mp4`, `DualShot_[timestamp]_landscape.mp4`
- **Location:** Phone storage (configurable in gallery app)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native (Expo 51+) |
| **Language** | TypeScript 5.0+ |
| **Navigation** | expo-router (file-based) |
| **Camera** | expo-camera (native bindings) |
| **Video Processing** | ffmpeg-kit-react-native (compiled FFmpeg) |
| **Gallery Access** | expo-media-library (Photos API) |
| **Storage** | Device storage (no cloud) |
| **State Management** | React Context (settings) |
| **Build System** | EAS Build (managed Expo CI/CD) |

### Why This Stack?

- **Expo:** No ejection needed, rapid iteration, managed builds
- **ffmpeg-kit:** Pre-compiled FFmpeg binary, proven video processing
- **TypeScript:** Type safety across the codebase
- **Context API:** Lightweight state for settings (no Redux overkill)
- **No backend:** Privacy by design — all processing on device

---

## 📁 Project Structure

```
DualShot-Recorder-/
├── app/
│   ├── _layout.tsx           # Root Stack Navigator
│   ├── index.tsx             # Camera recording screen
│   ├── preview.tsx           # Dual-crop preview (portrait vs landscape)
│   └── settings.tsx          # Resolution, FPS, format configuration
├── lib/
│   ├── cropper.ts            # FFmpeg dual-crop logic
│   │   ├── cropPortrait()    # 9:16 crop function
│   │   ├── cropLandscape()   # 16:9 crop function
│   │   └── processDualCrop() # Orchestrates both in parallel
│   ├── settings.tsx          # Settings Context Provider
│   ├── storage.ts            # Storage estimation utility
│   └── types.ts              # TypeScript interfaces
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build profiles (dev, prod)
├── package.json
├── tsconfig.json             # TypeScript strict mode
├── .gitignore
├── LICENSE                   # MIT License
└── README.md                 # This file
```

---

## 🎥 How It Works

### Video Crop Algorithm

DualShot uses FFmpeg to intelligently crop a single recording into two formats:

**Portrait (9:16) Crop:**
```
ffmpeg -i input.mp4 -vf "crop=ih*9/16:ih:(iw-ih*9/16)/2:0" portrait.mp4
```
- Takes full **height** of video
- Crops width to 9:16 aspect ratio
- Centers horizontally (removes equal margins from left/right)

**Landscape (16:9) Crop:**
```
ffmpeg -i input.mp4 -vf "crop=iw:iw*9/16:0:(ih-iw*9/16)/2" landscape.mp4
```
- Takes full **width** of video
- Crops height to 16:9 aspect ratio
- Centers vertically (removes equal margins from top/bottom)

### Processing Pipeline

```
User presses RECORD
        ↓
Camera captures video → device storage
        ↓
User presses STOP
        ↓
FFmpeg Pass 1: Portrait crop (9:16)  ─┐
FFmpeg Pass 2: Landscape crop (16:9) ─┼→ (Parallel)
        ↓
Side-by-side preview loads
        ↓
User presses SAVE
        ↓
Both files added to gallery album
```

---

## 🔐 Privacy & Security

- ✅ **No cloud uploads** — all processing on-device
- ✅ **No analytics** — no event tracking or telemetry
- ✅ **No user accounts** — no login required
- ✅ **No ads** — clean, focused experience
- ✅ **No permissions beyond camera/storage** — minimal attack surface
- ✅ **Open source** — code auditable, no hidden behavior

---

## 📋 Roadmap

### v1.1 (In Progress)
- [ ] iOS support (using AVFoundation instead of expo-camera)
- [ ] Trim/seek in preview before processing
- [ ] Custom watermark overlay
- [ ] Batch processing (record multiple, process in background)

### v1.2 (Planned)
- [ ] Video stabilization (via FFmpeg)
- [ ] Slow-motion rendering
- [ ] Green screen removal (basic chroma key)
- [ ] Export to cloud storage (optional, user-initiated)

### v2.0 (Vision)
- [ ] AI-powered framing suggestions
- [ ] Automatic best-take selection from multiple recordings
- [ ] Real-time effects (filters, color grading)
- [ ] Web companion for desktop preview/edit

---

## 🤝 Contributing

We welcome contributions! DualShot is intentionally simple — please keep PRs focused on one feature/fix.

### Before You Start
1. **Check [Issues](https://github.com/rakshan-rakshan/DualShot-Recorder-/issues)** — avoid duplicate work
2. **Fork the repository**
3. **Create a feature branch:** `git checkout -b feature/your-feature-name`

### Development Workflow

```bash
# Install dependencies
npm install

# Start dev server
npx expo start

# Run linter (if configured)
npm run lint

# Build dev APK for testing
eas build --profile development --platform android
```

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add video stabilization option
fix: correct FFmpeg crop offset calculation
docs: improve README setup instructions
style: format TypeScript strict mode
refactor: simplify cropper.ts logic
test: add unit tests for crop functions
chore: update dependencies
```

### Pull Request Process

1. **Update tests** — add/update tests for your changes
2. **Update docs** — if you add features, document them
3. **Test on device** — build APK and verify on Android phone
4. **Describe your PR clearly:**
   - What problem does it solve?
   - How did you test it?
   - Any breaking changes?

### Code Style

- **TypeScript strict mode** — all files must be strict-compliant
- **Naming:** camelCase for variables/functions, PascalCase for components/types
- **Imports:** Absolute paths (using `@/` alias if configured)
- **Comments:** Explain *why*, not *what*

---

## 🐛 Reporting Issues

Found a bug? Open an [issue](https://github.com/rakshan-rakshan/DualShot-Recorder-/issues) with:

- 📱 **Device & OS version** (e.g., Samsung Galaxy S23, Android 14)
- 🎬 **Video specs** (resolution, FPS, file size)
- 🔴 **What went wrong** (error message, expected behavior vs actual)
- 📸 **Screenshots** (if applicable)
- 📝 **Steps to reproduce**

---

## 💰 Support the Project

DualShot is free and ad-free. If it saves you time:

- ⭐ **Star this repo** — helps others discover it
- ☕ **[Buy me a coffee](https://buymeacoffee.com/rakshan)** — fuels development
- 💬 **Share feedback** — open an issue or discussion
- 🐦 **Spread the word** — tell a friend!

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for full terms.

**TL;DR:** You can use, modify, and distribute DualShot freely (even commercially), as long as you include the license and don't hold me liable.

---

## 👤 Author

**Rakshan** — Full-stack developer, open-source advocate

- GitHub: [@rakshan-rakshan](https://github.com/rakshan-rakshan)
- Twitter: [@AwinashKassia](https://twitter.com/AwinashKassia)
- Website: [yoursite.com](https://yoursite.com)

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev) — seamless React Native development
- [ffmpeg-kit](https://github.com/tanersener/ffmpeg-kit) — powerful video processing
- [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/) — native camera access
- Community — thanks to everyone reporting issues and suggesting features

---

<div align="center">

**Made with ❤️ by Rakshan**

[⬆ back to top](#dualshot-recorder)

</div>
