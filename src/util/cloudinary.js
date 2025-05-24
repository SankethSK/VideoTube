import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

const cloudinary_cloud_name=process.env.CLOUDINARY_CLOUD_NAME
const cloudinary_api_key=process.env.CLOUDINARY_API_KEY
const cloudinary_api_secret=process.env.CLOUDINARY_API_SECRET

cloudinary.config({ 
    cloud_name: cloudinary_cloud_name, 
    api_key: cloudinary_api_key, 
    api_secret: cloudinary_api_secret
});

const uploadToCloud = async (localFilePath) =>{
    try {
        if(!localFilePath) return;
        const response = await cloudinary.uploader.upload(
            localFilePath,{
                resource_type: "auto"
            })
        console.log("File uploaded successfully: ",response)
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadToCloud}