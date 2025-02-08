import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async(req,res)=>{
    console.log("🚀 Request received at /register"); 
    console.log(req.body); // Check if the request reaches here
    res.status(200).json({
        message:"ok"
    })
})

export {registerUser}