import {v2 as cloudinary} from 'cloudinary'
import fs from "fs" // it is fileSystem it is inbuilt function for js 

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY , 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});



const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath){
            console.log("local file path not found")
            return null;
        }
        // upload the file on cloudinary 
        // upload will take time so we have to use await 
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has beem uploaded successfully 
        // console.log("file is uploaded in cloudinary ",response.url)
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temprary
        //  file as the upload operation fot fail

        return null;
    }
}

export {uploadOnCloudinary}

