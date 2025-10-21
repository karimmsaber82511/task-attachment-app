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

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- Angular CLI (v15 or later)
- .NET Core SDK (for backend API)
- SQL Server (or alternative database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskattachment.client.git
   cd taskattachment.client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```
   Update the environment variables as needed.

4. **Start the development server**
   ```bash
   ng serve
   ```
   The application will be available at `http://localhost:4200/`

## 🛠 Development

### Project Structure

```
src/
├── app/
│   ├── components/       # Reusable components
│   ├── services/         # Application services
│   ├── models/           # TypeScript interfaces and models
│   ├── guards/           # Route guards
│   ├── interceptors/     # HTTP interceptors
│   └── app.module.ts     # Root module
├── assets/              # Static assets
└── environments/        # Environment configurations
```

### Available Scripts

- `ng serve` - Start development server
- `ng build` - Build for production
- `ng test` - Run unit tests
- `ng e2e` - Run end-to-end tests
- `ng lint` - Run linting

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

 
