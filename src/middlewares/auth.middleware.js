
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        //in case cookies we dont have it case of mobile application so we use header 
    
        if(!token){
            throw new ApiError(401,'Unothorized request')
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
        if(!user){
            throw new ApiError(401,"Inavalid access token")
        }
    
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message|| "invalid access token")
    }
})