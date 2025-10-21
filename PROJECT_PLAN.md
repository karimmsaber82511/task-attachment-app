# Real-Time Chat Application - Project Plan

## Project Overview
Build a real-time chat application using ASP.NET Core Web API + SignalR, Angular, and SQL Server.

---

## Technology Stack
- **Backend**: ASP.NET Core Web API + SignalR
- **Frontend**: Angular
- **Database**: SQL Server
- **Real-time Communication**: SignalR

---

## Development Phases

### Phase 1: Project Setup & Infrastructure
**Status**: ✅ Complete

#### Backend Setup
- [x] Create ASP.NET Core Web API project
- [x] Install required NuGet packages:
  - Microsoft.AspNetCore.SignalR
  - Microsoft.EntityFrameworkCore.SqlServer
  - Microsoft.EntityFrameworkCore.Tools
- [x] Configure CORS for Angular frontend
- [x] Set up dependency injection and middleware

#### Frontend Setup
- [x] Create/Configure Angular project
- [x] Install required npm packages:
  - @microsoft/signalr
  - FormsModule for two-way binding
- [x] Configure services and models
- [x] Modern UI with CSS gradients

#### Database Setup
- [x] Design database schema
- [x] Create Entity Framework Core models
- [x] Set up DbContext
- [x] Create initial migration
- [x] Configure connection string
- [x] Apply migrations to SQL Server

---

### Phase 2: Tier 1 - Core Functionality (REQUIRED)
**Status**: ✅ Complete - Ready for Testing

#### Database Models & Schema
- [x] **User Model**
  - UserId (PK)
  - Username
  - CreatedAt
  
- [x] **Message Model**
  - MessageId (PK)
  - SenderId (FK to User)
  - Content (max 150 chars)
  - Timestamp
  - IsRead

- [x] **Repository Pattern**
  - Using DbContext directly (simplified approach)

#### Backend API Development
- [x] **SignalR Hub**
  - Create ChatHub class
  - Implement SendMessage method
  - Implement connection/disconnection handling
  - Message validation (150 char limit)

- [x] **API Controllers**
  - MessagesController (GET conversation history)
  - UsersController (GET/POST user operations)

- [x] **Services Layer**
  - Business logic in ChatHub and Controllers
  - Message validation (150 char limit)
  - User management

#### Frontend Development
- [x] **Chat Component**
  - Message list display
  - Message input with character counter (150 max)
  - Real-time message updates
  - Scroll to bottom on new message

- [x] **SignalR Service**
  - Connection management
  - Send message method
  - Receive message handler
  - Connection status indicator

- [x] **User Interface**
  - Clean, modern chat UI
  - Message bubbles (sent/received styling)
  - Timestamp display
  - User identification
  - Character counter (150/150)

- [x] **User Management**
  - Simple username entry/selection
  - Username creation via API



---

### Phase 3: Tier 2 - Advanced Features (OPTIONAL)
**Status**: ⏳ Pending

#### Multiple Chat Rooms
- [ ] **Database Updates**
  - Room/Group Model (RoomId, Name, CreatedAt)
  - Update Message Model (add RoomId FK)
  - RoomMember Model (many-to-many relationship)

- [ ] **Backend Updates**
  - Update ChatHub for room-based messaging
  - RoomsController (CRUD operations)
  - Join/Leave room methods
  - Room-specific message history

- [ ] **Frontend Updates**
  - Room list component
  - Room creation dialog
  - Room selection/switching
  - Active room indicator

#### File Upload - Images
- [ ] **Backend**
  - File upload endpoint
  - Image validation (type, size)
  - Store files in wwwroot or blob storage
  - Attachment Model (AttachmentId, MessageId, FileType, FilePath)
  - Generate thumbnails (optional)

- [ ] **Frontend**
  - File picker for images
  - Image preview before send
  - Display images inline in chat
  - Image lightbox/modal view

#### File Upload - PDFs
- [ ] **Backend**
  - PDF file validation
  - Secure file storage
  - Download endpoint with authorization

- [ ] **Frontend**
  - PDF file picker
  - Display PDF icon with filename
  - Download link functionality
  - File size display

---

### Phase 4: Tier 3 - Bonus Challenge (OPTIONAL)
**Status**: ⏳ Pending

#### Voice Messaging
- [ ] **Frontend**
  - Implement Web Audio API for recording
  - Record button with visual feedback
  - Recording duration limit (e.g., 60 seconds)
  - Audio preview before sending
  - Convert to appropriate format (WebM/MP3)

- [ ] **Backend**
  - Audio file upload endpoint
  - Audio file validation (format, size, duration)
  - Store audio files securely
  - Update Attachment model for audio type

- [ ] **Playback**
  - Audio player component
  - Play/pause controls
  - Progress bar
  - Duration display

---

### Phase 5: Polish & Documentation
**Status**: ⏳ Pending

#### Code Quality
- [ ] Code cleanup and refactoring
- [ ] Add XML documentation comments
- [ ] Implement error handling and logging
- [ ] Add input validation and sanitization
- [ ] Security review (XSS, SQL injection prevention)

#### Git Management
- [ ] Clear commit messages
- [ ] Logical commit history
- [ ] Feature branches (if applicable)
- [ ] .gitignore properly configured

#### Documentation
- [ ] **README.md**
  - Project description
  - Technology stack
  - Prerequisites (Node.js, .NET SDK, SQL Server)
  - Database setup instructions
  - Backend setup and run instructions
  - Frontend setup and run instructions
  - Environment configuration
  - Features implemented
  - Screenshots (optional but recommended)

- [ ] **Code Comments**
  - Complex logic explanation
  - API endpoint documentation
  - Component documentation

#### Testing
- [ ] Manual testing checklist
- [ ] Unit tests (if time permits)
- [ ] Integration tests (if time permits)

---

## Database Schema

### Users Table
```sql
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

### Messages Table (Tier 1)
```sql
CREATE TABLE Messages (
    MessageId INT PRIMARY KEY IDENTITY(1,1),
    SenderId INT NOT NULL,
    Content NVARCHAR(150) NOT NULL,
    Timestamp DATETIME2 DEFAULT GETDATE(),
    IsRead BIT DEFAULT 0,
    FOREIGN KEY (SenderId) REFERENCES Users(UserId)
);
```

### Rooms Table (Tier 2)
```sql
CREATE TABLE Rooms (
    RoomId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

### RoomMembers Table (Tier 2)
```sql
CREATE TABLE RoomMembers (
    RoomId INT NOT NULL,
    UserId INT NOT NULL,
    JoinedAt DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (RoomId, UserId),
    FOREIGN KEY (RoomId) REFERENCES Rooms(RoomId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
```

### Attachments Table (Tier 2 & 3)
```sql
CREATE TABLE Attachments (
    AttachmentId INT PRIMARY KEY IDENTITY(1,1),
    MessageId INT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    FileType NVARCHAR(50) NOT NULL, -- 'image', 'pdf', 'audio'
    FileSize BIGINT NOT NULL,
    UploadedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (MessageId) REFERENCES Messages(MessageId)
);
```

---

## API Endpoints

### Tier 1 Endpoints
- `GET /api/messages` - Get conversation history
- `GET /api/messages/{id}` - Get specific message
- `POST /api/users` - Create/register user
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get specific user

### SignalR Hub Methods (Tier 1)
- `SendMessage(string username, string message)` - Send a message
- `OnConnectedAsync()` - Handle user connection
- `OnDisconnectedAsync()` - Handle user disconnection

### Tier 2 Endpoints
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/{id}/messages` - Get room messages
- `POST /api/rooms/{id}/join` - Join a room
- `POST /api/rooms/{id}/leave` - Leave a room
- `POST /api/attachments/upload` - Upload file
- `GET /api/attachments/{id}/download` - Download file

### SignalR Hub Methods (Tier 2)
- `SendMessageToRoom(string roomId, string username, string message)`
- `JoinRoom(string roomId)`
- `LeaveRoom(string roomId)`

---

## Frontend Components Structure

```
src/app/
├── components/
│   ├── chat/
│   │   ├── chat.component.ts
│   │   ├── chat.component.html
│   │   └── chat.component.css
│   ├── message-list/
│   │   ├── message-list.component.ts
│   │   ├── message-list.component.html
│   │   └── message-list.component.css
│   ├── message-input/
│   │   ├── message-input.component.ts
│   │   ├── message-input.component.html
│   │   └── message-input.component.css
│   ├── room-list/ (Tier 2)
│   │   ├── room-list.component.ts
│   │   ├── room-list.component.html
│   │   └── room-list.component.css
│   └── user-list/
│       ├── user-list.component.ts
│       ├── user-list.component.html
│       └── user-list.component.css
├── services/
│   ├── chat.service.ts (SignalR connection)
│   ├── message.service.ts (HTTP API)
│   ├── user.service.ts (HTTP API)
│   └── file-upload.service.ts (Tier 2)
├── models/
│   ├── message.model.ts
│   ├── user.model.ts
│   ├── room.model.ts (Tier 2)
│   └── attachment.model.ts (Tier 2)
└── app.component.ts
```

---

## Backend Project Structure

```
TaskAttachment.Server/
├── Controllers/
│   ├── MessagesController.cs
│   ├── UsersController.cs
│   ├── RoomsController.cs (Tier 2)
│   └── AttachmentsController.cs (Tier 2)
├── Hubs/
│   └── ChatHub.cs
├── Models/
│   ├── User.cs
│   ├── Message.cs
│   ├── Room.cs (Tier 2)
│   ├── RoomMember.cs (Tier 2)
│   └── Attachment.cs (Tier 2)
├── Data/
│   ├── ApplicationDbContext.cs
│   └── Migrations/
├── Services/
│   ├── IChatService.cs
│   ├── ChatService.cs
│   ├── IUserService.cs
│   └── UserService.cs
├── Repositories/
│   ├── IRepository.cs
│   ├── Repository.cs
│   ├── IMessageRepository.cs
│   └── MessageRepository.cs
├── DTOs/
│   ├── MessageDto.cs
│   ├── UserDto.cs
│   └── CreateMessageDto.cs
└── Program.cs
```

---

## Priority & Time Allocation

### High Priority (Must Complete)
1. **Tier 1 - Core Functionality** (Estimated: 6-8 hours)
   - Focus on clean, well-structured code
   - Ensure real-time messaging works flawlessly
   - Proper error handling
   - Database persistence

### Medium Priority (If Time Permits)
2. **Tier 2 - Multiple Rooms** (Estimated: 3-4 hours)
   - Adds significant value
   - Shows understanding of complex data relationships

3. **Tier 2 - Image Upload** (Estimated: 2-3 hours)
   - Common feature in chat apps
   - Demonstrates file handling skills

### Low Priority (Nice to Have)
4. **Tier 2 - PDF Upload** (Estimated: 1-2 hours)
   - Similar to image upload
   - Quick to implement after images

5. **Tier 3 - Voice Messaging** (Estimated: 4-5 hours)
   - Most complex feature
   - Only if all other features are solid

---

## Development Best Practices

### Code Quality
- Follow SOLID principles
- Use dependency injection
- Implement repository pattern
- Use DTOs for API responses
- Proper error handling and logging
- Input validation on both frontend and backend

### Security
- Sanitize user inputs (prevent XSS)
- Use parameterized queries (prevent SQL injection)
- Validate file uploads (type, size)
- Implement CORS properly
- Use HTTPS in production

### Git Workflow
- Commit frequently with clear messages
- Use conventional commit format:
  - `feat: add message sending functionality`
  - `fix: resolve character limit validation`
  - `refactor: improve ChatHub structure`
  - `docs: update README with setup instructions`

### Testing Strategy
- Test with multiple users simultaneously
- Test edge cases (empty messages, max length, special characters)
- Test file uploads (various formats, sizes)
- Test connection loss and reconnection
- Test database persistence

---

## Submission Checklist

- [ ] All Tier 1 features working correctly
- [ ] Code is clean, readable, and well-organized
- [ ] Clear commit history with logical progression
- [ ] README.md with complete setup instructions
- [ ] Database migrations included
- [ ] No hardcoded credentials (use appsettings.json)
- [ ] Project runs successfully on fresh clone
- [ ] Tested with multiple users
- [ ] Repository is public on GitHub
- [ ] Submit link at least 1 hour before interview

---

## Notes & Considerations

### Performance
- Consider pagination for message history
- Implement message caching if needed
- Optimize database queries with proper indexes

### User Experience
- Loading indicators for async operations
- Error messages for failed operations
- Smooth scrolling in chat window
- Responsive design for mobile devices

### Scalability Considerations
- SignalR can scale with Azure SignalR Service
- File storage can move to Azure Blob Storage
- Database can be optimized with indexes

---

## Resources & References

### Documentation
- [SignalR Documentation](https://docs.microsoft.com/en-us/aspnet/core/signalr/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [Angular Documentation](https://angular.io/docs)
- [@microsoft/signalr npm package](https://www.npmjs.com/package/@microsoft/signalr)

### Useful Tutorials
- ASP.NET Core SignalR with Angular
- Entity Framework Core migrations
- File upload in ASP.NET Core
- Web Audio API for recording

---

## Success Criteria

### Minimum Viable Product (Tier 1)
✅ Two users can exchange messages in real-time
✅ Messages are limited to 150 characters
✅ Conversation history is stored and retrievable
✅ Clean, readable code structure
✅ Clear README with setup instructions

### Excellent Submission
✅ All Tier 1 features + multiple rooms
✅ Image upload working smoothly
✅ Exceptional code quality and organization
✅ Comprehensive error handling
✅ Great user experience
✅ Detailed documentation

---

**Last Updated**: October 21, 2025
**Target Completion**: Before interview (submit 1 hour prior)
