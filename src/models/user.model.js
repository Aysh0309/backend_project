import mongoose ,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true //to enable searching but is expensive
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true //to enable searching
    },
    avatar:{
        type:String,//cloudinary url 
        required:true,
    },
    coverImage:{
        type:String
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Vedio"
        }
    ],
    password:{
        type:String,
        required:[true,"password is required"]
    },
    refreshToken:{
        type:String
    }

},{timestamps:true})


userSchema.pre('save',async function(next){
    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password,10)
    next()
})

//this pre is a hook using which we can perfom a task pre of any other funtion
//do not use arrow function as it does not have this function
//save  the password only when the pass word is change 

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}
//using methods we can add are own custom  methods

userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    //Data stored inside token.
    process.env.ACCESS_TOKEN_SECRET,
    //Used to sign token securely.
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
    //sign is used to create token
}
userSchema.methods.generateRefreshToken=function(){
     return jwt.sign({
        _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User=mongoose.model('User',userSchema)