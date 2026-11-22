const router=require('express').Router(),pool=require('../config/db');
const {authenticate,allowRoles}=require('../middleware/auth'),wrap=require('../utils/asyncHandler');
router.use(authenticate);
const hr=allowRoles('admin','hr_manager'), acct=allowRoles('admin','accountant');

router.get('/departments',wrap(async(req,res)=>res.json((await pool.query('SELECT * FROM Department ORDER BY dept_name')).rows)));

router.get('/employees',wrap(async(req,res)=>{
 let q;
 if(req.user.role==='employee_user') q=await pool.query('SELECT emp_id,dept_id,name,email,phone,designation,join_date,employment_status FROM Employee WHERE emp_id=$1',[req.user.empId]);
 else if(['admin','hr_manager','accountant'].includes(req.user.role)) q=await pool.query('SELECT e.*,d.dept_name FROM Employee e JOIN Department d USING(dept_id) ORDER BY emp_id');
 else return res.sendStatus(403);
 res.json(q.rows);
}));
router.post('/employees',hr,wrap(async(req,res)=>{
 const {deptId,name,email,phone,dob,designation,joinDate}=req.body;
 if(!deptId||!name||!email)return res.status(400).json({message:'deptId, name and email required.'});
 const q=await pool.query('INSERT INTO Employee(dept_id,name,email,phone,dob,designation,join_date) VALUES($1,$2,$3,$4,$5,$6,COALESCE($7::date,CURRENT_DATE)) RETURNING *',[deptId,name,email,phone||null,dob||null,designation||null,joinDate||null]);
 res.status(201).json(q.rows[0]);
}));
router.put('/employees/:id',hr,wrap(async(req,res)=>{
 const {deptId,name,email,phone,designation,employmentStatus}=req.body;
 const q=await pool.query(`UPDATE Employee SET dept_id=COALESCE($1,dept_id),name=COALESCE($2,name),email=COALESCE($3,email),phone=COALESCE($4,phone),designation=COALESCE($5,designation),employment_status=COALESCE($6,employment_status) WHERE emp_id=$7 RETURNING *`,
 [deptId??null,name??null,email??null,phone??null,designation??null,employmentStatus??null,req.params.id]);
 if(!q.rowCount)return res.status(404).json({message:'Employee not found.'});res.json(q.rows[0]);
}));

router.get('/attendance',wrap(async(req,res)=>{
 if(!['admin','hr_manager','employee_user'].includes(req.user.role))return res.sendStatus(403);
 const own=req.user.role==='employee_user';
 const q=await pool.query(`SELECT a.*,e.name FROM Attendance a JOIN Employee e USING(emp_id) ${own?'WHERE a.emp_id=$1':''} ORDER BY attendance_date DESC LIMIT 500`,own?[req.user.empId]:[]);
 res.json(q.rows);
}));
router.post('/attendance',hr,wrap(async(req,res)=>{
 const {empId,attendanceDate,checkIn,checkOut,status}=req.body;
 const q=await pool.query(`INSERT INTO Attendance(emp_id,attendance_date,check_in,check_out,status) VALUES($1,$2,$3,$4,$5)
 ON CONFLICT(emp_id,attendance_date) DO UPDATE SET check_in=EXCLUDED.check_in,check_out=EXCLUDED.check_out,status=EXCLUDED.status RETURNING *`,
 [empId,attendanceDate,checkIn||null,checkOut||null,status]);res.status(201).json(q.rows[0]);
}));

router.get('/leaves',wrap(async(req,res)=>{
 if(!['admin','hr_manager','employee_user'].includes(req.user.role))return res.sendStatus(403);
 const own=req.user.role==='employee_user';
 const q=await pool.query(`SELECT l.*,e.name FROM LeaveRecord l JOIN Employee e USING(emp_id) ${own?'WHERE l.emp_id=$1':''} ORDER BY start_date DESC`,own?[req.user.empId]:[]);
 res.json(q.rows);
}));
router.post('/leaves',wrap(async(req,res)=>{
 const own=req.user.role==='employee_user';
 if(!own&&!['admin','hr_manager'].includes(req.user.role))return res.sendStatus(403);
 const {empId,leaveType,startDate,endDate,reason}=req.body;
 const q=await pool.query(`INSERT INTO LeaveRecord(emp_id,leave_type,start_date,end_date,status,reason) VALUES($1,$2,$3,$4,'Pending',$5) RETURNING *`,
 [own?req.user.empId:empId,leaveType,startDate,endDate,reason||null]);res.status(201).json(q.rows[0]);
}));
router.put('/leaves/:id/status',hr,wrap(async(req,res)=>{
 const {status}=req.body;if(!['Approved','Rejected','Pending'].includes(status))return res.status(400).json({message:'Invalid status.'});
 const q=await pool.query('UPDATE LeaveRecord SET status=$1 WHERE leave_id=$2 RETURNING *',[status,req.params.id]);
 if(!q.rowCount)return res.status(404).json({message:'Leave not found.'});res.json(q.rows[0]);
}));

router.get('/salaries',wrap(async(req,res)=>{
 if(!['admin','accountant','employee_user'].includes(req.user.role))return res.sendStatus(403);
 const own=req.user.role==='employee_user';
 const q=await pool.query(`SELECT * FROM Salary ${own?'WHERE emp_id=$1':''} ORDER BY salary_year DESC,salary_month DESC`,own?[req.user.empId]:[]);res.json(q.rows);
}));
router.post('/salaries',acct,wrap(async(req,res)=>{
 const {empId,salaryMonth,salaryYear,basicSalary,allowances=0,deductions=0}=req.body;
 const q=await pool.query(`INSERT INTO Salary(emp_id,salary_month,salary_year,basic_salary,allowances,deductions) VALUES($1,$2,$3,$4,$5,$6)
 ON CONFLICT(emp_id,salary_month,salary_year) DO UPDATE SET basic_salary=EXCLUDED.basic_salary,allowances=EXCLUDED.allowances,deductions=EXCLUDED.deductions RETURNING *`,
 [empId,salaryMonth,salaryYear,basicSalary,allowances,deductions]);res.status(201).json(q.rows[0]);
}));
router.get('/payroll',wrap(async(req,res)=>{
 if(!['admin','accountant','employee_user'].includes(req.user.role))return res.sendStatus(403);
 const own=req.user.role==='employee_user';
 const q=await pool.query(`SELECT p.*,e.name FROM Payroll p JOIN Employee e USING(emp_id) ${own?'WHERE p.emp_id=$1':''} ORDER BY salary_year DESC,salary_month DESC`,own?[req.user.empId]:[]);res.json(q.rows);
}));
router.post('/payroll/generate',acct,wrap(async(req,res)=>{
 const {empId,salaryMonth,salaryYear}=req.body;
 await pool.query('CALL generate_payroll($1,$2,$3)',[empId,salaryMonth,salaryYear]);
 const q=await pool.query('SELECT * FROM Payroll WHERE emp_id=$1 AND salary_month=$2 AND salary_year=$3',[empId,salaryMonth,salaryYear]);
 res.json({message:'Payroll generated.',payroll:q.rows[0]});
}));
router.get('/reports/monthly-payroll',allowRoles('admin','accountant'),wrap(async(req,res)=>{
 const q=await pool.query(`SELECT d.dept_name,p.salary_month,p.salary_year,COUNT(*) employee_count,SUM(p.gross_salary) total_gross,SUM(p.net_salary) total_net
 FROM Payroll p JOIN Employee e USING(emp_id) JOIN Department d USING(dept_id)
 GROUP BY d.dept_name,p.salary_month,p.salary_year ORDER BY p.salary_year,p.salary_month,d.dept_name`);res.json(q.rows);
}));
router.get('/reports/attendance-summary',allowRoles('admin','hr_manager'),wrap(async(req,res)=>{
 const q=await pool.query(`SELECT e.emp_id,e.name,COUNT(a.att_id) total_records,
 COUNT(*) FILTER(WHERE a.status='Present') present_days,COUNT(*) FILTER(WHERE a.status='Absent') absent_days,
 COUNT(*) FILTER(WHERE a.status='Late') late_days,COUNT(*) FILTER(WHERE a.status='Leave') leave_days
 FROM Employee e LEFT JOIN Attendance a USING(emp_id) GROUP BY e.emp_id,e.name ORDER BY e.emp_id`);res.json(q.rows);
}));
module.exports=router;
