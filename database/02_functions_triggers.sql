CREATE OR REPLACE FUNCTION calculate_tax(p_gross NUMERIC) RETURNS NUMERIC
LANGUAGE plpgsql AS $$
BEGIN
 IF p_gross <= 30000 THEN RETURN ROUND(p_gross*0.05,2);
 ELSIF p_gross <= 60000 THEN RETURN ROUND(p_gross*0.10,2);
 ELSE RETURN ROUND(p_gross*0.20,2); END IF;
END; $$;

CREATE OR REPLACE FUNCTION calculate_net_salary(p_basic NUMERIC,p_allowances NUMERIC,p_deductions NUMERIC)
RETURNS NUMERIC LANGUAGE plpgsql AS $$
DECLARE v_gross NUMERIC; BEGIN
 v_gross:=p_basic+p_allowances;
 RETURN v_gross-p_deductions-calculate_tax(v_gross);
END; $$;

CREATE OR REPLACE PROCEDURE generate_payroll(p_emp_id INTEGER,p_month INTEGER,p_year INTEGER)
LANGUAGE plpgsql AS $$
DECLARE s Salary%ROWTYPE; g NUMERIC; t NUMERIC; n NUMERIC;
BEGIN
 SELECT * INTO s FROM Salary WHERE emp_id=p_emp_id AND salary_month=p_month AND salary_year=p_year;
 IF NOT FOUND THEN RAISE EXCEPTION 'Salary record not found'; END IF;
 g:=s.basic_salary+s.allowances; t:=calculate_tax(g); n:=g-s.deductions-t;
 INSERT INTO Payroll(emp_id,salary_month,salary_year,gross_salary,tax_amount,total_deductions,net_salary)
 VALUES(p_emp_id,p_month,p_year,g,t,s.deductions,n)
 ON CONFLICT(emp_id,salary_month,salary_year) DO UPDATE SET
 gross_salary=EXCLUDED.gross_salary,tax_amount=EXCLUDED.tax_amount,
 total_deductions=EXCLUDED.total_deductions,net_salary=EXCLUDED.net_salary,
 generated_at=CURRENT_TIMESTAMP;
END; $$;

CREATE OR REPLACE FUNCTION validate_attendance() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.check_out IS NOT NULL AND NEW.check_in IS NULL THEN
  RAISE EXCEPTION 'Check-out cannot be recorded without check-in';
 END IF;
 IF NEW.check_in IS NULL AND NEW.status='Late' THEN
  RAISE EXCEPTION 'Late attendance requires check-in';
 END IF;
 RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_attendance_validate ON Attendance;
CREATE TRIGGER trg_attendance_validate BEFORE INSERT OR UPDATE ON Attendance
FOR EACH ROW EXECUTE FUNCTION validate_attendance();

CREATE OR REPLACE FUNCTION prevent_overlapping_approved_leave() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.status='Approved' AND EXISTS(
  SELECT 1 FROM LeaveRecord l WHERE l.emp_id=NEW.emp_id AND l.status='Approved'
  AND l.leave_id<>COALESCE(NEW.leave_id,-1)
  AND daterange(l.start_date,l.end_date,'[]') && daterange(NEW.start_date,NEW.end_date,'[]')
 ) THEN RAISE EXCEPTION 'Overlapping approved leave exists'; END IF;
 RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_leave_overlap ON LeaveRecord;
CREATE TRIGGER trg_leave_overlap BEFORE INSERT OR UPDATE ON LeaveRecord
FOR EACH ROW EXECUTE FUNCTION prevent_overlapping_approved_leave();
