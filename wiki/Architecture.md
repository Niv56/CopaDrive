## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native Mobile App                   │
│                      (Expo / JavaScript)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   NodeJS REST API Server                     │
│            (Express / JWT Authentication)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│              (Users, Files, Permissions)                     │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Mobile Client**
- React Native with Expo
- Expo Router for file-based navigation
- React Native Gesture Handler for swipe interactions
- Expo AV for audio/video playback
- Expo Image Picker for camera/gallery access
- Expo File System for local file operations
- AsyncStorage for persistent local storage
- Expo Blur for glassmorphism effects

**Backend**
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Docker for containerization

### Project Structure

```
CopaDrive/
├── mobile-client/                 # React Native Expo App
│   ├── src/
│   │   ├── app/                   # Expo Router pages
│   │   │   ├── (app)/             # Authenticated routes
│   │   │   │   ├── home.jsx       # Main dashboard
│   │   │   │   ├── recent.jsx     # Recent files
│   │   │   │   ├── important.jsx  # Important files
│   │   │   │   ├── storage.jsx    # Storage view
│   │   │   │   ├── trash.jsx      # Trash management
│   │   │   │   └── _layout.jsx    # Drawer navigation
│   │   │   ├── (auth)/            # Authentication routes
│   │   │   │   ├── login.jsx      # Login screen
│   │   │   │   ├── register.jsx   # Registration flow
│   │   │   │   └── _layout.jsx    # Auth layout
│   │   │   ├── providers/         # Context providers
│   │   │   │   ├── AuthContext.jsx
│   │   │   │   ├── ThemeContext.jsx
│   │   │   │   └── MusicContext.jsx
│   │   │   └── _layout.jsx        # Root layout
│   │   ├── features/
│   │   │   ├── auth/              # Authentication feature
│   │   │   ├── drive/             # File management feature
│   │   │   └── user/              # User profile feature
│   │   ├── layout/                # Shared layout components
│   │   │   ├── TopBar.jsx
│   │   │   ├── BottomBar.jsx
│   │   │   ├── SideBar.jsx
│   │   │   ├── fab/               # Floating Action Button
│   │   │   └── SearchBar/
│   │   ├── shared_code/           # Shared utilities
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── styles/
│   │   │   └── utils/
│   │   └── assets/                # Images, fonts, audio
│   ├── package.json
│   └── babel.config.js
│
├── web-server/                    # NodeJS Backend
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml             # Docker orchestration
├── wiki/                          # Documentation
└── README.md
```

### Key Components

**Authentication Flow**
- JWT tokens are stored in AsyncStorage
- Tokens are automatically included in API requests
- Route guards redirect unauthenticated users to login

**File Storage**
- Files are stored as Base64 encoded content in MongoDB
- Text files can be edited directly in the app

**Theme System**
- Theme preference persists across app restarts
- Uses React Context for global state
- Supports both light and dark modes

**Event System**
- Uses React Native's DeviceEventEmitter for cross-component communication
- `emitDriveRefresh()` notifies all components to reload data
- `emitNavigateToFolder()` handles navigation from search results

**Auto IP Detection**
- The mobile client automatically detects the server IP address using Expo's debugger host