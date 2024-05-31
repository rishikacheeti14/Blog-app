const jwt=require('jsonwebtoken')
require('dotenv').config()

function verifyToken(req,res,next){
    
    const bearerToken=req.headers.authorization;
  
    if(!bearerToken){
        return res.send({message:"Unauthorized access. Plz login to continue"})
    }
   
    const token=bearerToken.split(' ')[1]
   
    try{
        jwt.verify(token,process.env.SECRET_KEY)
        next()
    }catch(err){
        next(err)
    }
}


module.exports=verifyToken;