# DualShot — Setup & Deploy Guide

## Step 1: Push to GitHub

```powershell
cd C:\Users\Rakshan\DualShotRecorder

# Replace all files with the new project files
# (keep node_modules if they exist)

git init
git add .
git commit -m "feat: DualShot Recorder v1.0.0"
git branch -M main
git remote add origin https://github.com/AwinashKassia/dualshot-recorder.git
git push -u origin main
```

## Step 2: Enable GitHub Pages (landing page)

1. Go to repo Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main`, folder: `/docs`
4. Save
5. Your site will be live at: https://AwinashKassia.github.io/dualshot-recorder/

## Step 3: Test in Expo Go (basic features)

```powershell
npm install
npx expo start
# Scan QR code with Expo Go app on your phone
```

This works for testing camera, recording, and the preview/settings screens.
FFmpeg cropping won't work in Expo Go — it needs a dev build.

## Step 4: Build Dev APK (full features)

```powershell
npm install -g eas-cli
eas login                    # Use your expo.dev account
eas build --profile development --platform android
```

Wait ~15 min. EAS builds in the cloud. Download the APK link and install on your phone.

## Step 5: Build Production AAB for Play Store

```powershell
eas build --profile production --platform android
```

## Step 6: Submit to Play Store

1. Create a Google Play Developer account ($25 one-time): https://play.google.com/console
2. Create a new app in the Play Console
3. Fill in the listing using `docs/PLAY_STORE_LISTING.md`
4. Upload screenshots (record your screen, crop to Play Store specs)
5. Set up a Google Cloud service account for automated submissions:
   - Save the JSON key as `google-service-account.json` in the project root
   - Run: `eas submit --platform android`

## Step 7: Set Up Buy Me a Coffee

1. Go to https://buymeacoffee.com and create account as "rakshan"
2. The link in the app and landing page already points to it

## Step 8: Premium In-App Purchase (later)

When ready to add the $4.99 premium unlock:
1. Set up in-app products in Google Play Console
2. Add `react-native-iap` or `expo-in-app-purchases`
3. Wire the upgrade button in settings.tsx to the purchase flow
