import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))//use ->for middleware
/*Registers middleware globally.
Meaning:
run this for every request*/

app.use(express.json({limit:'16kb'}))
//“Automatically convert incoming JSON data into JavaScript objects, but only allow payloads up to 16 KB.”

app.use(express.urlencoded({extended:true,limit:'16kb'}))
//Used for handling: HTML form data
/*extended:false

Uses simple querystring library.

Cannot handle nested objects well.

extended:true

Uses qs library.

Can handle nested objects.*/
app.use(express.static("public"))
//Makes files inside public folder accessible directly.
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'
console.log("USER ROUTES LOADED");
//routes declration
app.use('/api/v1/users',userRouter)
//http://loacalhost:8000/api/v1/users/register
//this means when we go to /user the control will be passed to userROuter

export { app }