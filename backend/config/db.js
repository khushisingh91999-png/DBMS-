const {Pool}=require('pg');
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:5000});
pool.on('error',e=>console.error('PostgreSQL pool error:',e.message));
module.exports=pool;
