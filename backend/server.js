require('dotenv').config();
const express=require('express'),cors=require('cors'),helmet=require('helmet'),rateLimit=require('express-rate-limit');
const pool=require('./config/db');
if(!process.env.DATABASE_URL||!process.env.JWT_SECRET){console.error('Configure backend/.env first.');process.exit(1);}
const app=express();app.use(helmet());app.use(cors({origin:process.env.CORS_ORIGIN||'http://localhost:5173'}));app.use(express.json({limit:'1mb'}));
app.use(rateLimit({windowMs:15*60*1000,limit:300}));
app.get('/api/health',async(req,res)=>{try{await pool.query('SELECT 1');res.json({status:'ok',database:'connected'});}catch{res.status(503).json({status:'error',database:'unavailable'});}});
app.use('/api/auth',require('./routes/auth'));app.use('/api',require('./routes/api'));
app.use((req,res)=>res.status(404).json({message:'Route not found.'}));
app.use((err,req,res,next)=>{console.error(err);if(err.code==='23505')return res.status(409).json({message:'Duplicate record.'});if(err.code==='23503')return res.status(400).json({message:'Referenced record does not exist.'});if(err.code==='23514'||err.code==='P0001')return res.status(400).json({message:err.message});res.status(500).json({message:'Internal server error.'});});
app.listen(Number(process.env.PORT||5000),()=>console.log('API listening on port '+(process.env.PORT||5000)));
