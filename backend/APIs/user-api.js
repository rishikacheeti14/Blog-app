const express =require('express');
const userApp=express.Router();
const bcryptjs=require('bcryptjs');
const expressAsyncHandler=require('express-async-handler');
const jwt=require('jsonwebtoken');
const verifyToken=require('../middlewares/verifyToken')
require('dotenv').config();



let usercollection;
let articlescollection;
userApp.use((req,res,next)=>{
    usercollection=req.app.get('usercollection');
    articlescollection=req.app.get('articlescollection');
    next();
});



userApp.post('/user',expressAsyncHandler(async(req,res)=>{
    const newUser=req.body;
    const dbuser=await usercollection.findOne({username:newUser.username})
    if(dbuser!=null){
        res.send({message:"user existed"})
    }else{
        const hashedPassword=await bcryptjs.hash(newUser.password,6);
        newUser.password=hashedPassword;
        await usercollection.insertOne(newUser);
        res.send({message:"user created"});

    }


}));

userApp.post('/login',expressAsyncHandler(async(req,res)=>{
    const userCred=req.body;
    const dbuser=await usercollection.findOne({username:userCred.username});
    if(dbuser==null){
        res.send({message:"invalid username"})
    }else{
        const status=await bcryptjs.compare(userCred.password,dbuser.password)
        if(status==false){
            res.send({message:"invalid password"})
        }else{
            const signedToken=jwt.sign({username:dbuser.username},process.env.SECRET_KEY,{expiresIn:'1d'})
            res.status(200).send({message:"login success",token:signedToken,user:dbuser})


        }
    }
}));


userApp.get('/articles',verifyToken,expressAsyncHandler(async(req,res)=>{
    const articlescollection=req.app.get('articlescollection')
    let articlesList=await articlescollection.find({status:true}).toArray()
    res.send({message:"articles",payload:articlesList})
}))

userApp.post('/comment/:articleId',verifyToken,expressAsyncHandler(async(req,res)=>{
    const userComment=req.body;
    const articleIdfromUrl=(+req.params.articleId);
    let result=await articlescollection.updateOne({articleId:articleIdfromUrl},{$addToSet:{comments:userComment}})
    console.log(result)
    res.send({message:"comment posted"})

}))


module.exports=userApp;