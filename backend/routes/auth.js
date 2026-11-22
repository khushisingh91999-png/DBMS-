const router=require('express').Router();
const bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),pool=require('../config/db');
const {authenticate,allowRoles}=require('../middleware/auth');
const wrap=require('../utils/asyncHandler');

router.post('/login',wrap(async(req,res)=>{
 const {email,password}=req.body||{};
 if(!email||!password)return res.status(400).json({message:'Email and password required.'});
 const q=await pool.query('SELECT user_id,full_name,email,password_hash,role,emp_id,is_active FROM app_users WHERE lower(email)=lower($1)',[email.trim()]);
 const u=q.rows[0];
 if(!u||!u.is_active||!(await bcrypt.compare(password,u.password_hash)))return res.status(401).json({message:'Invalid email or password.'});
 const user={userId:u.user_id,name:u.full_name,email:u.email,role:u.role,empId:u.emp_id};
 const token=jwt.sign(user,process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'8h'});
 res.json({token,user});
}));
router.get('/me',authenticate,(req,res)=>res.json({user:req.user}));
router.post('/users',authenticate,allowRoles('admin'),wrap(async(req,res)=>{
 const {fullName,email,password,role,empId=null}=req.body||{};
 if(!fullName||!email||!password||password.length<8||!['admin','hr_manager','accountant','employee_user'].includes(role))
  return res.status(400).json({message:'Provide name, email, password (8+ chars) and valid role.'});
 if(role==='employee_user'&&!empId)return res.status(400).json({message:'Employee account requires empId.'});
 const hash=await bcrypt.hash(password,12);
 const r=await pool.query('INSERT INTO app_users(full_name,email,password_hash,role,emp_id) VALUES($1,$2,$3,$4,$5) RETURNING user_id,full_name,email,role,emp_id',[fullName,email.toLowerCase(),hash,role,empId]);
 res.status(201).json(r.rows[0]);
}));
module.exports=router;
