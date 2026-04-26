# 📈 Forex Journal — Production-Ready Trading App

A clean, modern Forex trading journal for Android/iOS built with React Native + Expo.

---

## 🗂 Complete File Structure

```
ForexJournal/
├── App.js                          # Root: onboarding + error boundary + loading
├── app.json                        # Expo config (icons, splash, permissions)
├── eas.json                        # EAS Build profiles (APK / AAB / TestFlight)
├── babel.config.js
├── package.json
│
├── assets/
│   ├── icon.png                    # 1024×1024 app icon
│   ├── adaptive-icon.png           # Android adaptive icon
│   ├── splash.png                  # Splash screen
│   └── favicon.png
│
└── src/
    ├── context/
    │   └── TradeContext.js         # Global state + AsyncStorage
    │
    ├── navigation/
    │   └── RootNavigator.js        # Tab + Stack navigation
    │
    ├── screens/
    │   ├── OnboardingScreen.js     # 4-slide first-launch onboarding
    │   ├── DashboardScreen.js      # Home: P&L hero, stats, recent trades
    │   ├── AddTradeScreen.js       # Trade logging form
    │   ├── TradeHistoryScreen.js   # Searchable + filterable list
    │   ├── TradeDetailScreen.js    # View / edit / delete trade
    │   ├── AnalyticsScreen.js      # Charts + performance metrics
    │   ├── CalendarScreen.js       # Daily summary calendar heatmap
    │   ├── JournalScreen.js        # Daily journal + mood tracking
    │   └── SettingsScreen.js       # Export, reset, preferences
    │
    ├── components/
    │   ├── ErrorBoundary.js        # Catches JS crashes gracefully
    │   ├── LoadingScreen.js        # Animated splash while loading
    │   ├── EquityCurveChart.js     # Custom SVG step-line chart
    │   ├── TradeCard.js            # Trade list item
    │   └── UIComponents.js         # Design system
    │
    ├── hooks/
    │   ├── useTradeValidation.js   # Form validation with SL/TP logic
    │   └── useExportCSV.js         # CSV export to device
    │
    ├── utils/
    │   └── formatters.js           # Formatters + constants
    │
    └── styles/
        └── theme.js                # Colors, typography, spacing
```

---

## 🚀 Launch Guide

### Step 1 — Install prerequisites

```bash
# Node.js 18+ required
node --version

# Install Expo CLI
npm install -g expo-cli eas-cli

# Install dependencies
cd ForexJournal
npm install
```

### Step 2 — Run locally for testing

```bash
# Start dev server
npx expo start

# Options shown in terminal:
# Press 'a' → Android emulator
# Press 'i' → iOS simulator  
# Scan QR → Expo Go on your phone
```

### Step 3 — Build a shareable APK (no Play Store needed)

```bash
# Login to Expo account (free)
eas login

# Configure your project
eas build:configure

# Build APK (takes ~10 min on EAS servers)
eas build --platform android --profile preview

# Download the .apk link → install on any Android device
```

### Step 4 — Build for Google Play Store

```bash
# Build App Bundle (.aab)
eas build --platform android --profile production

# Submit to Play Store (needs Google service account)
eas submit --platform android
```

---

## 📱 App Features (v1.0.0)

| Feature | Status |
|---|---|
| Trade logging (pair, direction, entry/exit, lots, SL/TP) | ✅ |
| Trade history with search + filter | ✅ |
| Analytics: equity curve, win rate, R:R, pair breakdown | ✅ |
| Calendar heatmap (daily P&L) | ✅ |
| Journal + emotion tracking | ✅ |
| Settings + data export | ✅ |
| Onboarding flow | ✅ |
| Error boundary (crash protection) | ✅ |
| Offline-first (AsyncStorage) | ✅ |
| App icon + splash screen | ✅ |

### Planned for v1.1
- Firebase sync (cross-device)
- Push notification reminders
- Trade screenshot attachments
- Multiple account support
- Custom starting balance

---

## 🔧 Customise Before Launch

### 1. Update your app identity

In `app.json`:
```json
"name": "Your App Name",
"android": { "package": "com.yourname.forexjournal" },
"ios": { "bundleIdentifier": "com.yourname.forexjournal" }
```

### 2. Set your EAS project ID

```bash
eas init   # links to your Expo account
```

Then update `app.json` → `extra.eas.projectId` with the ID shown.

### 3. Replace icons

Replace `assets/icon.png` (1024×1024) and `assets/splash.png` with your own designs.
Use https://icon.kitchen for quick icon generation.

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| Metro bundler error | `npx expo start --clear` |
| Dependency conflict | `npm install --legacy-peer-deps` |
| Build fails on EAS | `npx expo prebuild --clean` then retry |
| AsyncStorage error | Clear app data on device |
| Chart not rendering | Ensure `react-native-svg` is installed |

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| expo | ~51.0.0 | Framework |
| react-native | 0.74.1 | Core |
| @react-navigation | ^6.x | Navigation |
| react-native-chart-kit | ^6.12.0 | Bar charts |
| react-native-svg | 15.2.0 | Custom charts |
| async-storage | 1.23.1 | Local persistence |
| expo-linear-gradient | ~13.0.0 | UI gradients |
| date-fns | ^3.6.0 | Date formatting |
| expo-file-system | ~17.0.1 | CSV export |

---

Built with ❤️ for serious traders. v1.0.0

