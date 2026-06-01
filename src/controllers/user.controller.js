import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'


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
         console.log("3. User existence checked");//it will find the first user with this email or username 
        if(existedUser){
            throw new ApiError(409,'User with email or username already exists')
        }
       
      
        const avatarLocalPath= req.files?.avatar[0]?.path;//taking the image from the multer 
      console.log("4. Avatar path:", avatarLocalPath);
        //short form of let avatarPath;
// if (
//     req.files &&
//     req.files.avatar &&
//     req.files.avatar[0]
// ) {
//     avatarPath = req.files.avatar[0].path;
// }
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

export {registerUser}