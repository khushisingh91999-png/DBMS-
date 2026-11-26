# Quick API tests

Base URL: `http://localhost:5000`

1. `GET /api/health`
2. Login: `POST /api/auth/login` JSON `{"email":"your-admin-email","password":"your-password"}`
3. Add header `Authorization: Bearer <token>` to protected calls.
4. Create HR user: `POST /api/auth/users` JSON `{"fullName":"HR Manager","email":"hr@example.com","password":"ChangeMe123!","role":"hr_manager"}`
5. Create employee login: `POST /api/auth/users` JSON `{"fullName":"Riya Sharma","email":"riya.login@example.com","password":"ChangeMe123!","role":"employee_user","empId":1}`
6. Attendance: `POST /api/attendance` JSON `{"empId":1,"attendanceDate":"2025-10-01","checkIn":"09:00","checkOut":"17:00","status":"Present"}`
7. Generate payroll: `POST /api/payroll/generate` JSON `{"empId":1,"salaryMonth":7,"salaryYear":2025}`

Employee logins are scoped to their linked employee ID in the API. Use real passwords only locally; do not commit credentials.
