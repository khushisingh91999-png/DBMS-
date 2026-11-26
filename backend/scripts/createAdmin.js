require('dotenv').config();
const readline=require('readline'),bcrypt=require('bcryptjs'),pool=require('../config/db');
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
const ask=q=>new Promise(resolve=>rl.question(q,resolve));
(async()=>{try{
 const c=await pool.query("SELECT COUNT(*)::int n FROM app_users WHERE role='admin'");
 if(c.rows[0].n){console.log('Admin already exists.');return;}
 const name=(await ask('Admin name: ')).trim(),email=(await ask('Admin email: ')).trim().toLowerCase(),password=await ask('Password (8+ chars): ');
 if(!name||!email||password.length<8)throw new Error('Enter name/email and password of at least 8 characters.');
 const hash=await bcrypt.hash(password,12);
 await pool.query("INSERT INTO app_users(full_name,email,password_hash,role) VALUES($1,$2,$3,'admin')",[name,email,hash]);
 console.log('Admin account created.');
}catch(e){console.error(e.message);process.exitCode=1;}finally{rl.close();await pool.end();}})();
