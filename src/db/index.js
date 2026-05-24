import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB=async ()=>{
    try{
        //we store the response object 
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("MONGODB connection error:", error)
        process.exit(1);
        //this exits the process which is going on

    }


}

export default connectDB
//“Export this thing as the main/default value from this file.”
//It allows another file to import it without using {}.