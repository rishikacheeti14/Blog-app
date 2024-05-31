const express =require('express');
const app=express();
require('dotenv').config();
const mongoClient=require('mongodb').MongoClient;
const path=require('path')

app.use(express.static(path.join(__dirname,'../client/build')))


app.use(express.json());

mongoClient.connect(process.env.DB_URL)
.then(client=>{
    const blogdb=client.db('blogdb');
    const usercollection=blogdb.collection('usercollection');
    const articlescollection=blogdb.collection('articlescollection');
    const authorscollection=blogdb.collection('authorscollection');

    app.set('authorscollection',authorscollection);
    app.set('articlescollection',articlescollection);
    app.set('usercollection',usercollection);
    console.log('DB connection success');
})
.catch(err=>console.log("err in Db connection",err))


const userApp=require('./APIs/user-api');
const authorApp=require('./APIs/author-api');
const adminApp=require('./APIs/admin-api');

app.use('/user-api',userApp);
app.use('/author-api',authorApp);
app.use('/admin-api',adminApp);

app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'../client/build/index.html'))
})


app.use((err, req, res, next) => {
    console.error("Error occurred:",err);
    res.status(500).send({message:"error",payload:err.message});
});



const port=process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Web server on port ${port}`);
});