## Installation Guide

### Prerequisites
- Docker Desktop (with both checkboxes enabled - see below)
- Node.js (LTS) + npm
- Expo Go app on your mobile device

### Docker Desktop Settings (Required)
**In Control Panel:**

>path->
Control Panel\All Control Panel Items\Windows Defender Firewall\Allowed apps

Make sure **BOTH** of these options are **enabled**:

**1. Docker Desktop Backend** 

**2. Node.js JavaScript Runtime** 

> Both checkboxes must be enabled for the application to work properly!

### Environment Setup

**Rename**: web-server/.env.example → web-server/.env

Open web-server/.env and set your own secret:
```
JWT_SECRET="your-own-strong-secret"
```

### Run Instructions (PowerShell)

**Step 1: Install Mobile Dependencies (first time only)**
```
cd mobile-client
npm install
npx expo install @react-native-async-storage/async-storage
```

**Step 2: Start Backend Services (Terminal 1)**

From the project root:
```
docker-compose up --build
```

**Step 3: Start Mobile App (Terminal 2 - new terminal)**
```
cd mobile-client
npx expo start -c
```

**Step 4: Connect Your Device**
- Open the Expo Go app on your phone
- Scan the QR code displayed in the terminal
- Make sure your phone and computer are on the same WiFi network

### Quick Start Summary
```powershell
# Terminal 1 - Backend (from project root)
docker-compose up --build

# Terminal 2 - Mobile App (from mobile-client)
cd mobile-client
npm install
npx expo install @react-native-async-storage/async-storage
npx expo start -c
```