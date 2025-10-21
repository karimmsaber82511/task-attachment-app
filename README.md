# Task Attachment Client

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A modern, real-time task management application with file attachment capabilities, built with Angular and SignalR for seamless real-time updates.

## ✨ Features

- Real-time task updates using SignalR
- File attachments with upload progress
- Responsive design for all devices
- Modern UI/UX with Angular Material
- Secure authentication and authorization
- Real-time notifications

### Backend
- **Framework**: .NET Core 7.0+
- **Database**: SQL Server 2019+
- **Authentication**: JWT Bearer Tokens
- **Real-time**: SignalR
- **ORM**: Entity Framework Core

### Frontend
- **Framework**: Angular 15+
- **UI Components**: Angular Material
- **State Management**: RxJS
- **HTTP Client**: Angular HttpClient
- **Real-time**: @microsoft/signalr

## Getting Started

### Prerequisites

- [.NET 7.0+ SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v16.x LTS or later)
- [SQL Server 2019+](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or SQL Server LocalDB)
- [Angular CLI](https://angular.io/cli) (v15+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskattachment.client.git
   cd TaskAttachment
   ```

2. **Backend Setup**
   ```bash
   cd TaskAttachment.Server
   dotnet restore
   dotnet ef database update
   dotnet run
   ```
   > API will be available at: `https://localhost:5001`

3. **Frontend Setup**
   ```bash
   cd ../taskattachment.client
   npm install
   ng serve
   ```
   > Application will be available at: `http://localhost:4200`

## Project Structure

```
TaskAttachment/
├── TaskAttachment.Server/     # .NET Core Web API
│   ├── Controllers/          # API endpoints
│   ├── Data/                 # Database context & migrations
│   ├── DTOs/                 # Data transfer objects
│   ├── Hubs/                 # SignalR hubs
│   ├── Models/               # Domain models
│   └── Repositories/         # Data access layer
│
└── taskattachment.client/    # Angular frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/   # Reusable UI components
    │   │   ├── services/     # API services
    │   │   ├── models/       # TypeScript interfaces
    │   │   ├── guards/       # Route guards
    │   │   └── interceptors/ # HTTP interceptors
    │   ├── assets/           # Static files
    │   └── environments/     # Environment configs
    └── angular.json          # Angular config
```

## Development

### Available Scripts

#### Backend
```bash
dotnet build      # Build the solution
dotnet test       # Run tests
dotnet watch run  # Run with hot-reload
```

#### Frontend
```bash
ng serve          # Start development server
ng build         # Build for production
g test           # Run unit tests
g e2e            # Run end-to-end tests
```
## 📦 Dependencies

### Main Dependencies

- Angular 15+
- RxJS 7+
- SignalR for real-time communication
- Angular Material for UI components
- NgRx for state management (optional)

### Development Dependencies

- ESLint & Prettier for code quality
- Jest for testing
- Husky for Git hooks

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

 
