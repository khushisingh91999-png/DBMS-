# Payroll & Attendance Management — React Frontend

This frontend is designed to connect to the existing Express/PostgreSQL backend in the parent project. It uses the existing routes and JWT login; it does not create a new database or replace the backend.

## Requirements
- Node.js and npm
- Existing backend running at `http://localhost:5000`
- Existing PostgreSQL database and admin account

## Install and run
Open a new VS Code terminal (keep the backend terminal running):

```powershell
cd "C:\Users\khush\Downloads\Payroll_Attendance_System (backend)\Payroll_Attendance_System\frontend"
npm install
npm run dev
```

Open `http://localhost:5173`.

## Backend / frontend terminals
Terminal 1 — backend:
```powershell
cd ..\backend
npm run dev
```

Terminal 2 — frontend:
```powershell
cd ..\frontend
npm run dev
```

## API connection
By default the app calls `http://localhost:5000/api`. To change it, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Restart Vite after changing `.env`.

## Included screens
- Login and JWT session
- Overview dashboard
- Employees
- Attendance
- Leave management (employee requests; HR/Admin approval)
- Salary details
- Payroll generation and payroll list
- Reports (based on the signed-in role)
- Departments
- Admin user account creation

## Important notes
- The UI follows the existing backend endpoints in `backend/routes/auth.js` and `backend/routes/api.js`.
- Employee records can be added and edited through the backend API; this frontend currently adds employee records but does not expose delete because the backend has no employee DELETE route.
- Role restrictions are enforced by the backend. The frontend hides screens/actions that the current role cannot use, but the backend remains the security authority.
- Salary and payroll pages show only data the backend permits for the signed-in role.
- The dashboard shows the records returned by your existing database; it does not invent demo values.
