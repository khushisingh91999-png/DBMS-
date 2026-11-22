INSERT INTO Department(dept_id,dept_name,location) VALUES
(1,'Engineering','Gurugram'),(2,'QA and Testing','Gurugram'),(3,'HR','Gurugram'),
(4,'Finance','Gurugram'),(5,'IT Support','Gurugram')
ON CONFLICT(dept_id) DO NOTHING;

INSERT INTO Employee(emp_id,dept_id,name,email,phone,dob,designation,join_date,employment_status) VALUES
(1,1,'Riya Sharma','riya.sharma@example.com','9876500001','2001-04-12','Software Developer','2024-01-15','Active'),
(2,1,'Aman Verma','aman.verma@example.com','9876500002','2000-08-21','Backend Developer','2024-02-01','Active'),
(3,1,'Neha Gupta','neha.gupta@example.com','9876500003','2001-11-05','Frontend Developer','2024-03-10','Active'),
(4,1,'Arjun Mehta','arjun.mehta@example.com','9876500004','1999-06-18','Team Lead','2023-07-01','Active'),
(5,2,'Priya Singh','priya.singh@example.com','9876500005','2001-02-09','QA Engineer','2024-01-20','Active'),
(6,2,'Karan Mehta','karan.mehta@example.com','9876500006','2000-12-30','Test Engineer','2024-04-01','Active'),
(7,2,'Simran Kaur','simran.kaur@example.com','9876500007','2001-09-14','QA Analyst','2024-05-15','Active'),
(8,3,'Rohit Das','rohit.das@example.com','9876500008','1998-03-22','HR Executive','2023-06-01','Active'),
(9,4,'Ananya Roy','ananya.roy@example.com','9876500009','2000-07-11','Accountant','2023-09-01','Active'),
(10,5,'Vivek Jain','vivek.jain@example.com','9876500010','1999-10-02','IT Support Engineer','2023-08-01','Active')
ON CONFLICT(emp_id) DO NOTHING;

INSERT INTO LeaveRecord(leave_id,emp_id,leave_type,start_date,end_date,status,reason) VALUES
(1,1,'Casual Leave','2025-07-10','2025-07-11','Approved','Personal work'),
(2,2,'Sick Leave','2025-08-04','2025-08-05','Approved','Not feeling well'),
(3,3,'Earned Leave','2025-09-15','2025-09-17','Approved','Family function'),
(4,4,'Casual Leave','2025-07-21','2025-07-22','Pending','Personal work'),
(5,5,'Sick Leave','2025-08-18','2025-08-19','Approved','Medical rest')
ON CONFLICT(leave_id) DO NOTHING;

INSERT INTO Attendance(emp_id,attendance_date,check_in,check_out,status)
SELECT e.emp_id,d::date,
 CASE WHEN (e.emp_id+EXTRACT(DAY FROM d)::int)%17=0 THEN NULL ELSE TIME '09:00' END,
 CASE WHEN (e.emp_id+EXTRACT(DAY FROM d)::int)%17=0 THEN NULL ELSE TIME '17:00' END,
 CASE WHEN (e.emp_id+EXTRACT(DAY FROM d)::int)%17=0 THEN 'Absent'
      WHEN (e.emp_id+EXTRACT(DAY FROM d)::int)%11=0 THEN 'Late' ELSE 'Present' END
FROM Employee e CROSS JOIN generate_series(DATE '2025-07-01',DATE '2025-09-30',INTERVAL '1 day') d
WHERE EXTRACT(ISODOW FROM d)<6
ON CONFLICT(emp_id,attendance_date) DO NOTHING;

INSERT INTO Salary(emp_id,salary_month,salary_year,basic_salary,allowances,deductions)
SELECT e.emp_id,m,2025,35000+e.emp_id*2500,5000+e.emp_id*500,1500+e.emp_id*100
FROM Employee e CROSS JOIN generate_series(7,9) m
ON CONFLICT(emp_id,salary_month,salary_year) DO NOTHING;

DO $$ DECLARE r RECORD; BEGIN
 FOR r IN SELECT emp_id,salary_month,salary_year FROM Salary LOOP
  CALL generate_payroll(r.emp_id,r.salary_month,r.salary_year);
 END LOOP;
END; $$;
