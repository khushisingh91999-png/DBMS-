const jwt=require('jsonwebtoken');
function authenticate(req,res,next){
 const h=req.headers.authorization||'', token=h.startsWith('Bearer ')?h.slice(7):null;
 if(!token)return res.status(401).json({message:'Authentication required.'});
 try{req.user=jwt.verify(token,process.env.JWT_SECRET);next();}
 catch{return res.status(401).json({message:'Invalid or expired token.'});}
}
const allowRoles=(...roles)=>(req,res,next)=>req.user&&roles.includes(req.user.role)?next():res.status(403).json({message:'Permission denied.'});
module.exports={authenticate,allowRoles};
