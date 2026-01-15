## CopaDrive
## About the Application
This application is inspired by Google Drive, but built with our own design and custom features.
It includes user registration and login, file uploads, and a variety of actions you can perform on your files—all through a clean, calm, and user-friendly interface.
Static data is stored and served by the web server, while the actual file content is stored and managed by our C++ server.
Our UI email field supports addresses in the format **xxx@copa.com**, matching the branding of the application.

- **NodeJS Web Server (REST API)** 
handles user management, authentication using JWT, file metadata, and access permissions

- **C++ TCP Storage Server** 
stores and retrieves the compressed file content. The NodeJS server connects to it as a TCP client whenever file content needs to be uploaded, downloaded, or searched, and receives the result back for the API response.

### Main Features
- **Users & Authentication**
  - Register a new account
  - Login (JWT-based authentication)
  - View and edit user profile details

- **Files & Folders**
  - Upload files of any type
  - Download files
  - Edit/update file content
  - Create folders
  - Rename files and folders
  - View file details (creation/upload date, last opened)
  - Recents / frequently used files view
  - Multiple view modes (grid/list)

- **Search**
  - Search by file/folder name
  - Search inside file content (content search)

- **Organization & Labels**
  - Star files (favorites)
  - Mark files as important

- **Trash**
  - Move items to trash and restore them
  - Items in trash are permanently deleted after 30 days
  - Trash view displays how many days remain until permanent deletion

- **Sharing & Permissions**
  - Share files/folders with other users
  - Role-based permissions: Viewer / Editor / Owner
  - Only authorized users can view/edit based on their role

- **Storage & System**
  - Real storage usage display (actual size/quota view)
  - Static data is served by the NodeJS Web Server
  - File content is stored and retrieved via the C++ TCP Storage Server

- **UI / Experience**
  - Day/Night theme toggle
  - Background music player (PlaySong)
  - Calm, modern, and user-friendly interface

### Notes
- Authentication is handled using JWT.
- The NodeJS Web Server (REST API) manages users, auth, file/folder metadata, search, sharing, and permissions.
- The C++ TCP Storage Server stores and retrieves compressed file content; NodeJS connects to it as a TCP client for upload/download/content-search operations.
- We set **main4** as the default branch and froze **main3** so the Exercise 3 server remains unchanged.

### Prerequisites
- Docker Desktop
- Node.js (LTS) + npm

### Environment Setup (Required)
**Rename**: web-server/.env.example → web-server/.env
Open web-server/.env and set your own secret: **JWT_SECRET**="your-own-strong-secret"

### Run Instructions (PowerShell)
- From the project root: `docker compose up --build`
- open it in your browser http://localhost:4000 Or Ctrl + Click the URL in the terminal.

### App Run Example

**Loading page**

![Docker Build & Run](Images/1.png)

**Login page**

![Docker Build & Run](Images/2.png)

**Dark mode login page**

![Docker Build & Run](Images/3.png)

**First register page**

![Docker Build & Run](Images/4.png)

**Second register page**

![Docker Build & Run](Images/5.png)

**Third register page**

![Docker Build & Run](Images/6.png)

**Phone validation register page**

![Docker Build & Run](Images/7.png)

**Date validation register page**

![Docker Build & Run](Images/8.png)

**Fourth register page**

![Docker Build & Run](Images/9.png)

**Email and password instructions**

![Docker Build & Run](Images/10.png)

**Email and password validation**

![Docker Build & Run](Images/11.png)

**Email availability check**

![Docker Build & Run](Images/12.png)

**Registration confirmation page**

![Docker Build & Run](Images/13.png)

**Sign in with an existing account**

![Docker Build & Run](Images/14.png)

**Home page**

![Docker Build & Run](Images/15.png)

**Dark mode Home page**

![Docker Build & Run](Images/16.png)

**Dark mode, music, and profile button**

![Docker Build & Run](Images/17.png)

**Edit profile**

![Docker Build & Run](Images/18.png)

**Password change availability**

![Docker Build & Run](Images/19.png)

**“Are you sure?” screen**

![Docker Build & Run](Images/20.png)

**Add button**

![Docker Build & Run](Images/21.png)

**Upload a file from your computer**

![Docker Build & Run](Images/22.png)

**Upload an MP4 file**

![Docker Build & Run](Images/23.png)

**Upload an image**

![Docker Build & Run](Images/24.png)

**Create a file inside a folder**

![Docker Build & Run](Images/25.png)

**Support for a wide variety of file types**

![Docker Build & Run](Images/26.png)

**Option to move a file to a different location**

![Docker Build & Run](Images/27.png)

**View a file and access a variety of actions/options**

![Docker Build & Run](Images/28.png)

**File sharing**

![Docker Build & Run](Images/29.png)

**Permission management (viewer/editor/remove access)**

![Docker Build & Run](Images/30.png)

![Docker Build & Run](Images/31.png)

**My drive page**

![Docker Build & Run](Images/32.png)

**Grid view mode**

![Docker Build & Run](Images/33.png)

**Recent files page**

![Docker Build & Run](Images/34.png)

**Starred files page**

![Docker Build & Run](Images/35.png)

**Important files page (dark mode)**

![Docker Build & Run](Images/36.png)

**Files shared from another user**

![Docker Build & Run](Images/37.png)

**Trash page with restore options, a “days remaining” indicator, and an option to empty the trash**

![Docker Build & Run](Images/38.png)

![Docker Build & Run](Images/39.png)

**Storage page (15GB limit indicator)**

![Docker Build & Run](Images/40.png)

**Sidebar navigation with a storage meter and quick access to all pages**

![Docker Build & Run](Images/41.png)

**File search**

![Docker Build & Run](Images/42.png)

**Folder search**

![Docker Build & Run](Images/43.png)

**File editor page**

![Docker Build & Run](Images/45.png)

**Share a file with another user as a viewer**

![Docker Build & Run](Images/46.png)

**Viewer cannot edit the file.**

![Docker Build & Run](Images/47.png)

**A file received from another user**

![Docker Build & Run](Images/48.png)