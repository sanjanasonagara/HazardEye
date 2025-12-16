# Hazard-Eye

Hazard-Eye is a comprehensive safety management platform consisting of a localized mobile app for reporting, a web dashboard for supervisors, and a .NET backend for data processing.

## Project Structure

- **backend/HazardEye.API**: .NET 8 Web API handling authentication, incident management, and real-time updates via SignalR.
- **webPortalSupervisor/supervisor-dashboard**: React + TypeScript + Vite web portal for supervisors to view statistics and manage users/incidents.
- **mobile**: React Native (Expo) mobile application for field reporting.

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js & npm
- PostgreSQL (running on default port 5432)

### 1. Database Setup

Ensure PostgreSQL is running and a database named `hazardeeye` exists. The backend will automatically apply migrations and seed the database on startup.

### 2. Backend

```bash
cd backend/HazardEye.API
# Create a .env file with your secrets if not present (see .env.example)
dotnet watch run
```

Runs on `http://localhost:5200`.

### 3. Web Portal (Supervisor Dashboard)

```bash
cd webPortalSupervisor/supervisor-dashboard
npm install
npm run dev
```

Runs on `http://localhost:5173`.
Default Admin: `admin@hazardeeye.com` / `AdminPassword123!`

### 4. Mobile App

```bash
cd mobile
npm install
npm start
```

Use Expo Go or an Android Emulator to run the app.

## Features

- **RBAC**: Admin, SafetyOfficer, and Viewer roles.
- **Real-time Updates**: SignalR integration for instant dashboard updates.
- **Secure Auth**: JWT-based authentication for both mobile and web clients.
- **User Management**: Admins can manage system users directly from the dashboard.

## License

Private and Confidential.