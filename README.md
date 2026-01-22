## CopaDrive

## About the Application
This application is inspired by Google Drive, built as a React Native mobile app with our own tropical design theme and custom features.
It includes user registration and login, file uploads, and a variety of actions you can perform on your files—all through a clean, calm, and user-friendly mobile interface.
All data is stored in MongoDB and served by our NodeJS REST API server.
Our UI email field supports addresses in the format **"xxx @copa.com**, matching the branding of the application.

- **React Native Mobile App (Expo)**
provides the user interface with features like file management, sharing, search, and a modern tropical-themed design

- **NodeJS Web Server (REST API)**
handles user management, authentication using JWT, file metadata, permissions, and all business logic

- **MongoDB Database**
stores all user data, file content (Base64 encoded), folder structure, and sharing permissions

### Main Features

- **Users & Authentication**
  - Register a new account (multi-step registration flow)
  - Login (JWT-based authentication)
  - View and edit user profile details
  - Change password functionality
  - Profile picture upload from gallery
  - Israeli phone number validation (05X-XXX-XXXX format)

- **Files & Folders**
  - Upload files of any type (documents, images, videos, audio)
  - Download files to device
  - Edit/update text file content
  - Create folders with nested structure
  - Rename files and folders
  - Move files between folders
  - View file details (creation date, last modified)
  - Take photos directly from camera
  - Pick images from gallery

- **Navigation & Views**
  - Home - Dashboard with suggested files and folders
  - My Drive - Full file tree navigation with breadcrumbs
  - Starred - Favorite files view
  - Shared - Files shared by other users, grouped by owner
  - Recent - Recently accessed files
  - Important - High-priority marked items
  - Storage - Files sorted by size (largest first)

- **Search**
  - Real-time search by file/folder name
  - Search results dropdown with instant navigation
  - Navigate directly to folders from search

- **Organization & Labels**
  - Star files (favorites)
  - Mark files as important
  - Toggle star/important from file preview

- **Trash**
  - Move items to trash and restore them
  - Permanent deletion option
  - Empty entire trash
  - Items in trash are permanently deleted after 30 days
  - Trash view displays how many days remain until permanent deletion

- **Sharing & Permissions**
  - Share files/folders with other users by email
  - Role-based permissions: Viewer / Editor / Owner
  - Toggle between Viewer and Editor roles
  - Revoke user access
  - Only authorized users can view/edit based on their role

- **Storage & System**
  - Real storage usage display (used/quota)
  - Visual storage indicator (palm tree filling animation)
  - File size display in human-readable format

- **UI / Experience**
  - Day/Night theme toggle with persistence
  - Background music player (PlaySong)
  - Glassmorphism design elements (BlurView)
  - Swipe-to-delete gestures
  - Draggable bottom navigation bar
  - Animated transitions
  - Pull-to-refresh on all lists
  - Calm, modern, and tropical-themed interface

### Notes
- Authentication is handled using JWT.
- The NodeJS Web Server (REST API) manages users, auth, file/folder metadata, search, sharing, and permissions.
- All data is stored in MongoDB (users, files, permissions).
- The mobile client automatically detects the server IP address - no manual configuration needed.
- We set **main5** as the default branch for Exercise 5.

### Prerequisites
- Docker Desktop (with both checkboxes enabled - see images below)
- Node.js (LTS) + npm
- Expo Go app on your mobile device

### Docker Desktop Settings (Required)
Make sure **BOTH** of these options are **enabled** in Docker Desktop settings:

**1. Docker Desktop Backend** ☑

**2. Node.js JavaScript Runtime** ☑

### Environment Setup (Required)
**Rename**: web-server/.env.example → web-server/.env

Open web-server/.env and set your own secret: **JWT_SECRET**="your-own-strong-secret"

### Run Instructions (PowerShell)

**Step 1: Install Mobile Dependencies (first time only)**
```
cd mobile-client
npm install
npx expo install @react-native-async-storage/async-storage
```

**Step 2: Clean Previous Docker Containers (if any)**
```
docker-compose down
docker rm -f $(docker ps -aq)
```

**Step 3: Start Backend Services (Terminal 1)**
From the project root:
```
docker-compose up --build
```

**Step 4: Start Mobile App (Terminal 2 - new terminal)**
```
cd mobile-client
npx expo start -c
```

**Step 5: Connect Your Device**
- Open the Expo Go app on your phone
- Scan the QR code displayed in the terminal
- Make sure your phone and computer are on the same WiFi network

### App Run Example
For a deeper look into specific features, click the links below:

* [Authentication & Registration Flow](./wiki/userExpirence/Registration.md): A complete walkthrough of the multi-step sign-up process, credential security, and JWT-based authentication.
* [Profile Management](./wiki/userExpirence/EditProfile.md):Documentation on viewing user details, updating personal information, and profile picture integration.
* [File & Folder Management](./wiki/userExpirence/ManageFiles.md):Detailed guides on creating directories, uploading diverse file types (MP4, PNG, etc.), and managing permissions.
* [Search System](./wiki/userExpirence/SearchBar.md):Insights into real-time filtering for files and folders with instant navigation results.
* [Theme, Music & Storage Utilities](./wiki/userExpirence/AppTheme.md):Explore the "Palm Storage Tree," Day/Night theme persistence, and the integrated "PlaySong" background music player.