# Connect Logistics Tracker - Mobile App

Eine React Native App für Echtzeit-GPS-Tracking und Logistikmanagement, entwickelt mit Expo.

## 🚀 Schnellstart

### Voraussetzungen
- Node.js (v18 oder höher)
- npm oder yarn
- Expo CLI
- Backend-Server läuft auf Port 5001

### Installation

1. **Repository klonen und Dependencies installieren**
   ```bash
   npm install
   ```

2. **Environment-Variablen konfigurieren**
   
   Die `.env`-Datei ist bereits vorkonfiguriert für iOS Simulator:
   ```bash
   EXPO_PUBLIC_API_URL=http://localhost:5001/api/v1
   EXPO_PUBLIC_WS_URL=http://localhost:5001
   ```

   **Für andere Plattformen:**
   - **Android Emulator**: `cp .env.android .env`
   - **Echtes Gerät**: `cp .env.device .env` und IP-Adresse anpassen

3. **Google Maps API Key hinzufügen**
   
   Trage deinen API Key in der `.env`-Datei ein:
   ```
   EXPO_PUBLIC_GMAPS_API_KEY=dein_api_key_hier
   ```

4. **Backend starten**
   
   Stelle sicher, dass das Backend auf Port 5001 läuft:
   ```bash
   cd ../backend
   npm run dev
   ```

5. **App starten**
   ```bash
   # Entwicklungsserver
   npm start

   # iOS Simulator
   npm run ios

   # Android Emulator
   npm run android
   ```

## 📱 Features

- **Echtzeit-GPS-Tracking**: Live-Standortverfolgung im Hintergrund
- **WebSocket-Integration**: Echtzeit-Updates für Fahrzeuge und Standorte
- **Offline-Unterstützung**: Queue-System für GPS-Daten bei fehlender Verbindung
- **Rollenbasierte Zugriffskontrolle**: Admin, Carrier, Driver, Warehouse, Supplier
- **Google Maps Integration**: Interaktive Kartenansicht
- **Background Location Tracking**: Standortverfolgung auch wenn App im Hintergrund läuft
- **Geofencing**: Benachrichtigungen beim Betreten/Verlassen von Bereichen

## 🏗️ Projektstruktur

```
app/
├── (tabs)/              # Tab-basierte Navigation
│   ├── index.tsx        # Karten-Ansicht
│   └── two.tsx          # Zweiter Tab
├── contexts/            # React Context Provider
│   ├── AuthContext.tsx  # Authentifizierung
│   └── LocationContext.tsx  # Standort-Sharing
├── hooks/               # Custom React Hooks
│   └── useLiveLocation.ts
├── services/            # API und Services
│   ├── api.ts           # Axios API Client
│   ├── socket.ts        # Socket.IO Client
│   └── notifications.ts # Push-Benachrichtigungen
├── tasks/               # Background Tasks
│   ├── bgLocationTask.ts   # Hintergrund GPS-Tracking
│   └── geofenceTask.ts     # Geofencing
├── types/               # TypeScript Typen
├── utils/               # Hilfsfunktionen
└── _layout.tsx          # Root Layout

components/              # Wiederverwendbare Komponenten
constants/               # Konstanten und Konfiguration
assets/                  # Bilder, Fonts, etc.
```

## 🔧 Konfiguration

### Backend-Verbindung

Die App kommuniziert mit dem Backend über:
- **API Base URL**: `http://localhost:5001/api/v1`
- **WebSocket URL**: `http://localhost:5001`

### Plattform-spezifische URLs

| Plattform | API URL | Hinweis |
|-----------|---------|---------|
| iOS Simulator | `http://localhost:5001/api/v1` | Standard |
| Android Emulator | `http://10.0.2.2:5001/api/v1` | Emulator → Host |
| Echtes Gerät | `http://<DEINE_IP>:5001/api/v1` | Gleiches WLAN |

Siehe [SETUP.md](./SETUP.md) für detaillierte Anweisungen.

## 🧪 Testing

```bash
npm test
```

## 📦 Build

```bash
# Development Build
expo build:ios
expo build:android

# Production Build (mit EAS)
eas build --platform ios
eas build --platform android
```

## 🔐 Authentifizierung

Die App unterstützt verschiedene Benutzerrollen:
- **Admin**: Voller Zugriff
- **Carrier**: Transportverwaltung
- **Driver**: GPS-Tracking und Aufgaben
- **Warehouse**: Lagerverwaltung
- **Supplier**: Lieferantenzugriff

### Mock-Modus (Entwicklung)

Setze in der `.env`:
```
EXPO_PUBLIC_MOCK_AUTH=1
```

Login mit E-Mail-Präfix für Rollen:
- `admin@example.com` → Admin-Rolle
- `driver@example.com` → Driver-Rolle
- etc.

## 📡 WebSocket Events

### Client → Server
- `setup` - Benutzer verbinden
- `join company tracking` - Company Tracking Room beitreten
- `join vehicle tracking` - Fahrzeug Tracking Room beitreten

### Server → Client
- `connected` - Verbindung bestätigt
- `location update` - Live GPS-Update
- `notification` - Push-Benachrichtigung

## 🌍 Google Maps Setup

1. Google Maps API Key erstellen in [Google Cloud Console](https://console.cloud.google.com/)
2. Folgende APIs aktivieren:
   - Maps SDK for iOS
   - Maps SDK for Android
   - Geocoding API
3. API Key in `.env` eintragen

## 🐛 Troubleshooting

### Backend nicht erreichbar
- Überprüfe ob Backend auf Port 5001 läuft
- Prüfe die URL in `.env`
- Bei echtem Gerät: Gleiches WLAN nutzen

### WebSocket-Verbindung fehlgeschlagen
- Backend CORS-Konfiguration prüfen
- Firewall-Einstellungen überprüfen
- WebSocket-URL in `.env` kontrollieren

### GPS-Tracking funktioniert nicht
- Location-Permissions erteilt?
- Background-Permissions aktiviert?
- In iOS Simulator: Simulate Location aktivieren

Siehe [SETUP.md](./SETUP.md) für weitere Lösungen.

## 📄 Lizenz

Privates Projekt - Alle Rechte vorbehalten

## 🤝 Beitragen

Dieses Projekt ist Teil eines privaten Logistiksystems.

---

**Entwickelt mit ❤️ für effizientes Logistikmanagement**
