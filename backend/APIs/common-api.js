const express=require('express')
const commonApp=express.Router();



commonApp.get('/common',(req,res)=>{
    res.send({message:"reply from common app"})
})




module.exports=commonApp;