# Hazard-Eye Mobile App

Offline-first mobile application for field workers to report incidents.

##  Features
- **Offline-First**: All data stored locally (SQLite + FileSystem) until network is available.
- **Secure**: Application-level encryption and secure token storage.
- **Sync Engine**: Auto-sync incidents when back online.

##  Tech Stack
- **Framework**: Expo (React Native) + TypeScript
- **Database**: `expo-sqlite`
- **Security**: `expo-secure-store`, `expo-crypto`

##  Setup & Build

### Prerequisites
- Node.js & npm
- Expo Go app installed on your physical device (iOS/Android) or an Emulator.
### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
- **Start the Development Server**:
  ```bash
  npx expo start
  ```
- **Run on Device**: Scan the QR code with the Expo Go app.
- **Run on Emulator**: Press `a` for Android or `i` for iOS in the terminal.

##  Project Structure
- `app/`: Expo Router screens (Pages)
- `src/services/`: Core logic (Database, Sync)
- `assets/`: Images and fonts.

##  Troubleshooting
- **Network Issues**: Ensure your mobile device and computer are on the same Wi-Fi network.
- **Port Mapping**: Ensure your backend service is running on Port 5200 and is accessible from the mobile device (use your machine's IP address).

