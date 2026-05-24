import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))//use for middleware

app.use(express.json({limit:'16kb'}))
//“Automatically convert incoming JSON data into JavaScript objects, but only allow payloads up to 16 KB.”

app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static("public"))
app.use(cookieParser())
export { app }