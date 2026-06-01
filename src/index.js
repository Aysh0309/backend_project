//require('dotenv').config({path:'./.env})
import dotenv from "dotenv"
//import mongoose, { connection } from "mongoose"
//import { DB_NAME } from "./constants";//import a named export called DB_NAME
import connectDB from "./db/index.js";
import { app } from "./app.js";
//when using import for dotenv we have to use this
dotenv.config({
    path:'./.env'
})
console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(
  process.env.CLOUDINARY_API_SECRET ? "Secret Loaded" : "Secret Missing"
);

//as await function returns a promise
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>
    {
        console.log(`Server is runinng at port:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.error("MONGO DB connection failed!!",err)
})











/*
1->Approch first everything doing on the some file 

import express from "express"
const app=express()

here we use IIFE ->immediate invoked function express
;(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error: ",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`APP is listening on port${process.env.PORT}`)
        })
    }
    catch(error){
        console.error("ERROR:",error)
        throw error//it stops the execution and tell the user that an error occured
    }
})()
    */
