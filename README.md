# Payroll & Attendance Management System

PostgreSQL database + Node.js/Express REST API.

## Requirements
PostgreSQL 14+, Node.js 18+, npm.

## Database setup
1. In pgAdmin create database `payroll_attendance`.
2. Connect to it and execute SQL files in order:
   - `database/01_schema.sql`
   - `database/02_functions_triggers.sql`
   - `database/03_sample_data.sql`
   - `database/04_roles.sql`
   - `database/05_indexes.sql`

## Backend setup
Copy `backend/.env.example` to `backend/.env`, enter your PostgreSQL password, then:
```bash
cd backend
npm install
npm run create-admin
npm run dev
```
The API runs at `http://localhost:5000`; health check: `/api/health`.

Never upload `.env` or passwords to GitHub. This package is source code; it cannot create or connect to your local PostgreSQL database until you configure `.env` and execute the SQL scripts.

## Roles
`admin`, `hr_manager`, `accountant`, `employee_user`. API middleware checks roles, and employee accounts are scoped to their linked `emp_id`.

## API routes
POST `/api/auth/login`; GET `/api/auth/me`; POST `/api/auth/users` (admin);
GET/POST `/api/employees`; PUT `/api/employees/:id`;
GET/POST `/api/attendance`; GET/POST `/api/leaves`; PUT `/api/leaves/:id/status`;
GET/POST `/api/salaries`; GET `/api/payroll`; POST `/api/payroll/generate`;
GET `/api/reports/monthly-payroll`; GET `/api/reports/attendance-summary`.

Tax rates in the SQL function are assignment demo rates, not actual Indian tax advice. For production, add HTTPS, backups, audit logs, secret management, and database-level least privilege.
