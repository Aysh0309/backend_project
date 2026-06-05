import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { jwt } from 'jsonwebtoken'
import { MongoCryptKMSRequestNetworkTimeoutError } from 'mongodb'
import mongoose from 'mongoose'

//method for generating access and refeshToken
const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        //both these token goes to the user side 
        //but refrsh token are also stored in the DB
        user.refreshToken=refreshToken,
        await user.save({validateBeforeSave:false})
        //this is to tell explictitly that no need to validate other wise it will check for password and all

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,'Something went wrong while generation refresh and access token')
    }
}

//console.log("USER CONTROLLER LOADED");

const registerUser=asyncHandler(async (req,res)=>{
   // console.log("1. Controller entered");

    //get user detail from frontend
    //validation->not empty
    //check if user already exists:username,email
    //check for images,check for avatar(compulsary)
    //upload them to cloudinary,avatar
    //create user object- creare entry in DB
    //remove password and refresh token field form response 
    //check for user creation
    //return response  


    const {fullname,username,email,password}=req.body;
    //deconstructer
    //console.log("2. Body parsed");

    if(
        [fullname,username,email,password].some((field)=>
            field?.trim()===''
        )
    ){
            throw new ApiError(400,'all fields are required')
        }

        const existedUser=await User.findOne({
            $or:[{username},{email}]
        })
        //it will find the first user with this email or username 
        if(existedUser){
            throw new ApiError(409,'User with email or username already exists')
        }
       
      
        const avatarLocalPath= req.files?.avatar[0]?.path;//taking the image from the multer 
      console.log("4. Avatar path:", avatarLocalPath);
        //short form of let avatarPath;

       // const coverImageLocalPath=req.files?.coverImage?.[0]?.path;
       let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath=req.files.coverImage[0].path;
        }
        
       
       if(!avatarLocalPath)
        {
            throw new ApiError(400,'Avatar file is required')
        }


       const avatar= await uploadOnCloudinary(avatarLocalPath)
       const coverImage=await uploadOnCloudinary(coverImageLocalPath)
        console.log("6. Avatar uploaded:", avatar);
       if(!avatar){
         throw new ApiError(400,'Avatar file is required')
       }

       const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url ||"",
        email,
        password,
        username:username.toLowerCase(),
       })

       const createdUser=await User.findById(user._id).select(
        "-password  -refreshToken"   
      )
      //this select function helps us to remove the selceted fields

      if(!createdUser){
        throw new ApiError(500 ,"Something went wrong while registering the user")
      }


      return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered succesfully")
      )

    
})


const loginUser = asyncHandler( async (req,res) => {
    //req body->data
    //username or email
    //find the user 
    //password check
    //access and refresh token
    //send cookie

    const {email,username,password}=req.body
    if(!(username || email)){
        throw new ApiError(400,'Username or email is required')
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"User doesnot exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Wrong Password")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    const loggedInUser=await User.findById(user._id).select('-password -refreshToken')
    //we called it again as when we called it the first time it didnot have refreshtoken but now it does 

    //sending cookies
    const options={
        httpOnly:true,
        secure:true,
    }
    //not modifiabl by frontend but canbe by server


    return res.status(200).cookie("accessToken",accessToken,options)
    .cookie('refreshToken',refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser,accessToken,refreshToken
            },
            "User Loggen in SuccessFully"
        )
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    //now the prohlem here is we cant find the user as we dont have acess to his credentials
    //so now we will use the concept of middleware
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },{
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true,
    }
    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out "))
})

//no we create an end point to be hit when access tokens are refreshed using refresh token
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken ||
    req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized access")
    }

    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
       const user=await  User.findById(decodedToken?._id)
       if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !=user?.refreshToken)
            throw new ApiError(401," refresh token is expired or used ")
    
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,refreshToken:newRefreshToken
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
        
    }

})


const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body

    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    //when we save so our password get hashed automatically by our model

    return res.status(200)
    .json(new ApiResponse(
        200,{},"Password change successfully"
    ))

})

const getCurrentUser=asyncHandler(async (req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"Current user fetched succesfully"))
})

const updatAccountDetails =asyncHandler(async(req,res)=>{
    const {fullname ,email}=req.body

    if(!(fullname && email)){
        throw new ApiError(400,"please enter all the feilds")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"Account details updated succesfully"))
})


const updatUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
          throw new ApiError(400,"error while uploading  avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true,
        }
    ).select("-Password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Avatar Image updated succesfully")
    )
})

const updatUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
          throw new ApiError(400,"error while uploading  coverImage")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true,
        }
    ).select("-Password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Cover Image updated succesfully")
    )
})


//here we will learn about aggregation pipeline
const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params 
    //we use params when the data is part of the url

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    const channel=await User.aggregate([
        //in this array we can multiple pipleline through which are output will be filtered
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            //here we find the number of subscriber of the id 
            $lookup:{
                from: "subscriptions",//as in DB model name get to lowecase and plural
                localField: "_id",
                foreignField: "channel",
                as:"subscribers"
            }

        },
        {
            //here we find the number of subscriber channels of the user 
             $lookup:{
                from: "subscriptions",//as in DB model name get to lowecase and plural
                localField: "_id",
                foreignField: "subscriber",
                as:"subscribedTo"
            }
        },
        {
            //these fields will added to the User model
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $condition:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        //in the "subscribers" ke andr "subscriber" me hona chiye
                        then:true,
                        else:false
                    }
                }

            }
        },
        {
            //project is used to pass only essential data rather than all the data
            //After joining user data, $project removes sensitive fields before sending the response.
            $project:{
                fullname:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                coverImage:1,
                avatar:1,
                email:1,
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist ")
    }
    
    return res.status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )
})

//aggregation return array of objects but can be tranformed to object 



//here we will do nested look up
const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
               // _id:req.user._id
               //the thing is this req.user._id actually is  a string which is converted automatically
               //to the objtct id of mongodb by the mongoose 
               //but aggregation pipeline are passsed directly to the mongodb hence we need to properly write the cod e
               _id:new mongoose.Types.ObjectId(req.user._id)
            },
            
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:'owner',
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"owner"
                            }
                        }
                    }

                ]
            },

        }
    ])

    return res.status(200).json(
        new ApiResponse(200,user[0].watchHistory,"watch history fetchhed succesfully")
    )
})


export {registerUser,
    loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updatAccountDetails
    ,updatUserAvatar,updatUserCoverImage,getUserChannelProfile,getWatchHistory
}