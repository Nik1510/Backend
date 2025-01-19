// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDB()
// when-ever Async method is completed it return a promise 
.then(()=>{
    
    const server = app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is runnung at port : ${process.env.PORT}`)
    })
    server.on("error",(err)=>{
        console.error("An error occurred while starting the server",err);
        
    })
})
.catch((err)=>{
    console.log("MONGO DB connection failed !!!",err)
})









/*
// This is our first Approach  



import express from "express"
const app = express()

// IIFE is used 
(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/$
            {DB_NAME}`)
            app.on("error",(error)=>{
                console.log("ERRR:",error);
                throw error
            })
            app.listen(process.env.PORT ,()=>{
                console.log(`App is listening on port ${process.env.PORT}`)
            })
    }catch(error){
        console.log("ERROR:",error)
        throw err
    }
})()

*/