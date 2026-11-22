DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='payroll_admin') THEN CREATE ROLE payroll_admin NOLOGIN; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='hr_manager') THEN CREATE ROLE hr_manager NOLOGIN; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='accountant') THEN CREATE ROLE accountant NOLOGIN; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='employee_user') THEN CREATE ROLE employee_user NOLOGIN; END IF;
END $$;
GRANT USAGE ON SCHEMA public TO payroll_admin,hr_manager,accountant,employee_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO payroll_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO payroll_admin;
GRANT SELECT,INSERT,UPDATE,DELETE ON Department,Employee,Attendance,LeaveRecord TO hr_manager;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO hr_manager;
GRANT SELECT ON Employee,Department TO accountant;
GRANT SELECT,INSERT,UPDATE ON Salary,Payroll TO accountant;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO accountant;
GRANT SELECT ON Employee,Department,Attendance,LeaveRecord,Salary,Payroll TO employee_user;
