const exp=require('express');
const authorApp=exp.Router();
const expressAsyncHandler=require('express-async-handler')
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')
const verifyToken=require('../middlewares/verifyToken')


let authorscollection;
let articlescollection;

authorApp.use((req,res,next)=>{
    authorscollection=req.app.get('authorscollection')
    articlescollection=req.app.get('articlescollection')
    next()
})



authorApp.post('/user',expressAsyncHandler(async(req,res)=>{
   
    const newUser=req.body;
    const dbuser=await authorscollection.findOne({username:newUser.username})
    if(dbuser!==null){
        res.send({message:"User existed"})
    }else{
    const hashedPassword=await bcryptjs.hash(newUser.password,6)
    newUser.password=hashedPassword;
    await authorscollection.insertOne(newUser)
         res.send({message:"Author created"})
    }

}))



authorApp.post('/login',expressAsyncHandler(async(req,res)=>{
    
    const userCred=req.body;
    const dbuser=await authorscollection.findOne({username:userCred.username})
    if(dbuser===null){
        res.send({message:"Invalid username"})
    }else{
        const status=await bcryptjs.compare(userCred.password,dbuser.password)
       if(status===false){
        res.send({message:"Invalid password"})
       }else{
    
        const signedToken=jwt.sign({username:dbuser.username},process.env.SECRET_KEY,{expiresIn:'1d'})
        res.send({message:"login success",token:signedToken,user:dbuser})
       }
    }
}))


authorApp.post('/article',verifyToken,expressAsyncHandler(async(req,res)=>{
   const newArticle=req.body;
    console.log(newArticle)
    await articlescollection.insertOne(newArticle)
    res.send({message:"New article created"})
}))



authorApp.put('/article',verifyToken,expressAsyncHandler(async(req,res)=>{
   const modifiedArticle=req.body;let result= await articlescollection.updateOne({articleId:modifiedArticle.articleId},{$set:{...modifiedArticle}})
    let latestArticle=await articlescollection.findOne({articleId:modifiedArticle.articleId})
    res.send({message:"Article modified",article:latestArticle})
}))






authorApp.put('/article/:articleId',verifyToken,expressAsyncHandler(async(req,res)=>{
   
    const artileIdFromUrl=(+req.params.articleId);
     const articleToDelete=req.body;

    if(articleToDelete.status===true){
       let modifiedArt= await articlescollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:false}},{returnDocument:"after"})
       res.send({message:"article deleted",payload:modifiedArt.status})
    }
    if(articleToDelete.status===false){
        let modifiedArt= await articlescollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:true}},{returnDocument:"after"})
        res.send({message:"article restored",payload:modifiedArt.status})
    }
   
   
}))








//read articles of author
authorApp.get('/articles/:username',verifyToken,expressAsyncHandler(async(req,res)=>{
    //get author's username from url
    const authorName=req.params.username;
    //get atricles whose status is true
    const artclesList=await articlescollection.find({username:authorName}).toArray()
    res.send({message:"List of atricles",payload:artclesList})

}))

//export userApp
module.exports=authorApp;
