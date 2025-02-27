// only verify weather the user is there or not 

import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandler(
    async(req,_,next)=>{
        // request has cookies access  from app.use(cookieParser())
      try {
        const token =   req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
          throw new ApiError(401,"Unauthorized request")
      }
      const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
      if(!user){
          throw new ApiError(401,"Invalid Access Token")
      }

      
      req.user =user;
      next() //  when the routes is hit next tells there are more arguments to be excuted
      } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token ")
      }

})