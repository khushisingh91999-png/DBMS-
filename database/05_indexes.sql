CREATE INDEX IF NOT EXISTS idx_attendance_date ON Attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON Payroll(salary_year,salary_month);
CREATE INDEX IF NOT EXISTS idx_employee_department ON Employee(dept_id);
ANALYZE Attendance; ANALYZE Payroll; ANALYZE Employee;
