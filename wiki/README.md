## CopaDrive

## About the Application
This application is inspired by Google Drive, built as a React Native mobile app with our own tropical design theme and custom features.
It includes user registration and login, file uploads, and a variety of actions you can perform on your files—all through a clean, calm, and user-friendly mobile interface.
All data is stored in MongoDB and served by our NodeJS REST API server.
Our UI email field supports addresses in the format "**xxx @copa.com**", matching the branding of the application.

### Main Features

- **Users & Authentication**
  - Register a new account (multi-step registration flow)
  - Login (JWT-based authentication)
  - View and edit user profile details
  - Change password functionality
  - Profile picture upload from gallery

- **Files & Folders**
  - Upload files of any type (documents, images, videos, audio)
  - Download files to device
  - Edit/update text file content
  - Create folders with nested structure
  - Rename files and folders
  - Move files between folders
  - Take photos directly from camera

- **Navigation & Views**
  - Home, My Drive, Starred, Shared, Recent, Important, Storage

- **Search**
  - Real-time search by file/folder name
  - Navigate directly to folders from search

- **Trash**
  - Move items to trash and restore them
  - Items permanently deleted after 30 days
  - Display days remaining until deletion

- **Sharing & Permissions**
  - Share files/folders with other users by email
  - Role-based permissions: Viewer / Editor / Owner

- **UI / Experience**
  - Day/Night theme toggle
  - Background music player (PlaySong)
  - Swipe-to-delete gestures
  - Calm, modern, tropical-themed interface

### Documentation

| Document | Description |
|----------|-------------|
| [Installation Guide](installation.md) | Prerequisites and setup instructions |
| [Architecture](architecture.md) | System architecture and project structure |

### Notes
- Authentication is handled using JWT.
- The mobile client automatically detects the server IP address - no manual configuration needed.
- All data is stored in MongoDB (users, files, permissions).
- We set **main5** as the default branch for Exercise 5.