```mermaid
flowchart TB

    subgraph CLIENT ["Client (curl / browser)"]
        CReq["HTTP Request<br/>GET/POST/PATCH/DELETE"]
        CHeaders["Headers<br/>Content-Type: application/json<br/>X-User-Id: <id> (protected routes)"]
    end

    subgraph NODE ["NodeJS Web Server (Express)"]
        App["app.js<br/>express.json + logger<br/>mount routes<br/>404 + error middleware"]
        Routes["Routes<br/>/api/users<br/>/api/tokens<br/>/api/files<br/>/api/search"]
        AuthMW["authMiddleware.requireAuth<br/>reads X-User-Id or Bearer<br/>loads user -> req.user"]
        Controllers["Controllers<br/>userController<br/>authController<br/>fileController<br/>searchController"]
        Services["Services<br/>userService<br/>authService<br/>fileService"]
        Repos["Repositories<br/>userRepository<br/>fileRepository"]
        Utils["Utils<br/>validation.js<br/>idGenerator.js<br/>storage.js (users[], files[])"]
        Err["Global Error Handler<br/>returns JSON {error,status}"]
    end

    %% ===== Incoming request flow =====
    CReq --> App --> Routes

    %% ===== Users =====
    Routes -->|"POST /api/users"| Controllers
    Controllers -->|"validateFields"| Utils
    Controllers -->|"userService.registerUser"| Services
    Services -->|"uniqueness checks"| Repos
    Repos -->|"read/write"| Utils
    Services -->|"generateId() + set lastLogin"| Utils
    Controllers -->|"201 Created (safe DTO incl. image)"| CReq

    Routes -->|"GET /api/users/:id"| Controllers
    Controllers -->|"userService.getSafeUserById"| Services
    Services -->|"userRepository.findById"| Repos
    Repos --> Utils
    Controllers -->|"200 OK (safe DTO incl. image)"| CReq

    %% ===== Auth =====
    Routes -->|"POST /api/tokens"| Controllers
    Controllers -->|"validateFields"| Utils
    Controllers -->|"authService.verifyCredentials"| Services
    Services -->|"userRepository.findByUsername"| Repos
    Repos --> Utils
    Controllers -->|"200 OK {userId} or 401"| CReq

    %% ===== Files (protected) =====
    Routes -->|"GET/POST/PATCH/DELETE /api/files..."| AuthMW --> Controllers
    AuthMW -->|"userRepository.findById"| Repos
    Controllers -->|"fileService.*"| Services
    Services -->|"fileRepository.*"| Repos
    Repos --> Utils
    Services -->|"cycle check + recursive delete"| Repos
    Controllers -->|"JSON response / 204"| CReq

    %% ===== Search (protected) =====
    Routes -->|"GET /api/search/:query"| AuthMW --> Controllers
    Controllers -->|"fileRepository.searchFiles"| Repos
    Repos --> Utils
    Controllers -->|"200 OK results[]"| CReq

    %% ===== Errors =====
    App --> Err
    Controllers --> Err
    Services --> Err
    AuthMW --> Err
