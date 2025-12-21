```mermaid
classDiagram


class AppJS {
  +use(express.json)
  +requestLogger()
  +use(/api/users)
  +use(/api/tokens)
  +use(/api/files)
  +use(/api/search)
  +notFound404()
  +errorMiddleware()
  +listen(3000)
}

class UserRoutes {
  +POST /api/users
  +GET /api/users/:id
}
class AuthRoutes {
  +POST /api/tokens
}
class FileRoutes {
  +GET /api/files
  +POST /api/files
  +GET /api/files/:id
  +PATCH /api/files/:id
  +DELETE /api/files/:id
}
class SearchRoutes {
  +GET /api/search/:query
}

class UserController {
  +registerUser(req,res,next)
  +getUserById(req,res,next)
}
class AuthController {
  +login(req,res,next)
}
class FileController {
  +listTopLevel(req,res,next)
  +createItem(req,res,next)
  +getById(req,res,next)
  +updateItem(req,res,next)
  +deleteItem(req,res,next)
}
class SearchController {
  +search(req,res,next)
}

class UserService {
  +registerUser(userData)
  +getSafeUserById(userId)
}
class AuthService {
  +verifyCredentials(username,password)
}
class FileService {
  +listTopLevel(ownerId)
  +createItem(ownerId,payload)
  +getById(ownerId,id)
  +updateItem(ownerId,id,patch)
  +deleteItem(ownerId,id)
  -wouldCreateCycle(itemId,newParentId,ownerId)
  -collectSubtreeIds(ownerId,rootId)
}

class AuthMiddleware {
  +requireAuth(req,res,next)
}

class UserRepository {
  +findById(id)
  +findByUsername(username)
  +findByEmail(email)
  +findByPassword(password)
  +create(userData)
}
class FileRepository {
  +findByParent(parentId,ownerId)
  +findById(id,ownerId)
  +create(fileData)
  +update(id,updates,ownerId)
  +remove(id,ownerId)
  +hasChildren(parentId,ownerId)
  +searchFiles(userId,query)
}

class Storage {
  +users[]
  +files[]
}

class Validation {
  +validateFields(body,requiredFields)
  +validateExistence(resource,resourceName)
}

class IdGenerator {
  +generateId()
}

%% App wiring
AppJS --> UserRoutes
AppJS --> AuthRoutes
AppJS --> FileRoutes
AppJS --> SearchRoutes

%% Routes -> Controllers
UserRoutes --> UserController
AuthRoutes --> AuthController
FileRoutes --> FileController
SearchRoutes --> SearchController

%% Protected routes
FileRoutes --> AuthMiddleware : requireAuth
SearchRoutes --> AuthMiddleware : requireAuth

%% Controllers -> Services/Utils
UserController --> UserService
UserController --> Validation
AuthController --> AuthService
AuthController --> Validation
FileController --> FileService
SearchController --> FileRepository : direct (no service)

%% Services -> Repos/Utils
UserService --> UserRepository
UserService --> IdGenerator
AuthService --> UserRepository
FileService --> FileRepository
FileService --> IdGenerator

%% Middleware -> Repo
AuthMiddleware --> UserRepository

%% Repos -> Storage
UserRepository --> Storage
FileRepository --> Storage
