//file server se uthaenge 

import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'
//fs is file system for nodejs 
//file handling

    // Configuration
    

const uploadOnCloudinary=async (localFilePath)=>{
    try {
        cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET  
    });
     console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
        console.log("API Key:", process.env.CLOUDINARY_API_KEY);


        if(!localFilePath) return null
        //upload the file on cloudinary
        console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("Uploading:", localFilePath);
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded succesfully
        //console.log("File is uploaded on cloudinary",response.url)
        fs.unlinkSync(localFilePath)
        //removing syncronously
        return response;
    } catch (error) {
       console.log("========== CLOUDINARY ERROR ==========");
    console.log(error);
    console.log("=====================================");
        if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
    }
        //remove the locally saved file as the upload operationgot failed
        return null;
    }
}

export {uploadOnCloudinary}

