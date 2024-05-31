const express =require('express');
const adminApp=express.Router();

adminApp.get('/test-admin',(req,res)=>{
    res.send({message:"this is from admin api"});
});






module.exports=adminApp;