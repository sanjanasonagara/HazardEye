# Hazard-Eye

Hazard-Eye is a comprehensive safety management platform consisting of a localized mobile app for reporting, a web dashboard for supervisors, and a .NET backend for data processing.

##  Project Structure

### 1. Backend (`/backend/HazardEye.API`)
Built with **.NET 8 Web API**. Handles authentication, incident management, and real-time updates via SignalR.

- **`Controllers/`**: HTTP API endpoints.
  - `AuthController.cs`: User registration and login.
  - `IncidentsController.cs`: CRUD operations for incidents.
  - `TasksController.cs`: Management of safety tasks.
- **`Data/`**: Entity Framework Core configuration.
  - `HazardEyeDbContext.cs`: Database context definition.
- **`DTOs/`**: Data Transfer Objects for API requests/responses (e.g., `LoginDto`, `IncidentDto`).
- **`Hubs/`**: SignalR hubs for real-time WebSocket communication (`NotificationHub`).
- **`Models/`**: Domain entities representing the database schema (`Incident`, `User`, `WorkTask`).
- **`Services/`**: Business logic layer.
  - `AuthService.cs`: JWT generation and validation.
  - `IncidentService.cs`: Incident processing logic.
- **`Migrations/`**: EF Core database migration files.

### 2. Mobile App (`/mobile`)
Built with **React Native (Expo)**. Used by field workers and supervisors.

- **`app/`**: Expo Router file-based routing.
    - **`(supervisor)/`**: Routes specific to supervisors (e.g., verifying reports).
    - **`(tabs)/`**: Main tab navigation for workers (Home, History, Profile).
    - **`incidents/`**: Incident details and lists.
    - **`report/`**: Incident reporting form.
    - **`login.tsx`**: Authentication screen.
- **`src/`**: Shared source code.
    - **`components/`**: Reusable UI components.
    - **`hooks/`**: Custom React hooks.
    - **`services/`**: API integration services.
    - **`types/`**: TypeScript interfaces.
- **`assets/`**: Images, fonts, and icons.

### 3. Web Portal (`/webPortal`)
Built with **React + TypeScript + Vite**. Admin and Supervisor dashboard.

- **`src/`**: output source code.
    - **`admin/`**: Admin-specific views (User management, system settings).
    - **`supervisor/`**: Supervisor dashboard.
        - **`Dashboard.tsx`**: Main overview with charts and stats.
        - **`Incidents.tsx`**: Comprehensive incident table.
    - **`employee/`**: Employee-specific views (Task lists).
    - **`shared/`**: Reusable UI components (Buttons, Inputs, Modals) and contexts (AuthContext).
    - **`auth/`**: Login page and authentication logic.
- **`public/`**: Static assets.

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js & npm
- PostgreSQL (running on default port 5432)

### 1. Database Setup

Ensure PostgreSQL is running and a database named `hazard` exists. The backend will automatically apply migrations and seed the database on startup.

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
npm install expo
npx expo start
```


- `npm install` will automatically fix Gradle permissions.
- See `mobile/README.md` for detailed troubleshooting and cross-platform setup.

## Features

- **RBAC**: Admin, SafetyOfficer, and Viewer roles.
- **Real-time Updates**: SignalR integration for instant dashboard updates.
- **Secure Auth**: JWT-based authentication for both mobile and web clients.
- **User Management**: Admins can manage system users directly from the dashboard.

## License

Private and Confidential.