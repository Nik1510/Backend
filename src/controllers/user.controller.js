import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { response } from "express";


const generateAcccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.RefreshToken = refreshToken
        await user.save({validateBeforeSave : false}) // validateBeforeSave -> function avoid asking for password again and again 

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while refresh and access token ")
    }
} 

const registerUser = asyncHandler(async(req,res)=>{
     // get details from frontend 
     // validation - not empty 
     // check if user exist 
     // check for images 
     // check for avatar , check for avator 
     // upload them to cloudinary , avator check 
     // create user object - create entry in db
     //remove password and refersh token feild from response 
     // check for user creation 
     // return response to frontend
     


    //  1. to get detail we have request 
    const {fullName , email, username, password} =req.body
    // console.log("request body",req.body) // we get fullName , email , password, username 
    console.log("email: ",email);
    if(fullName===""){
        throw new ApiError(400,"fullName is required")
    }

    //  2. 
    if (
        [fullName,email,username,password].some((feild)=> feild?.trim()==="")
    ) {
        throw new ApiError(400,"All fields are required")
    }
    
   // 3. 
    const excitedUser = await User.findOne({
        $or: [{ username }, { email }]
        // console.log(username)
        // console.log(email)
    })
    if(excitedUser){
        throw new ApiError(409,"User with email or username already excited")
    }

    // 4.
     const avatarLocalPath = req.files?.avatar[0]?.path; // here we are getting the path of uploaded file 
    //  console.log(avatarLocalPath)
     const coverImageLocalPath = req.files?.coverImage[0]?.path; // error will come undefined if it doesnot work 

     // ------------------------------------second way of checking---------------------------------------------- 
     // both the ways are correct 
    //  let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }
    // ----------------------------------------------------------------------------------------------------------


        if(!avatarLocalPath){
            throw new ApiError(400, "Avator file are required ");
            
        }
    // console.log(req.files) // we get feildname, orginalname, encoding, mimetype, desttination, filename, path , size

    // 5. now upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400, "Avator file is required ")
    }

    // 6. create user object
    const user = await User.create({
        fullName,
        avatar:avatar?.url || "",
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        // by default are selected
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500 ,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User regiestered successfully ")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    // req body to retrive data
    // username or email 
    // find user 
    // password check 
    // access and refersh token 
    // send cookies 

    const {email, username, password}=req.body // req.body will provide email , username , password
    
    if (!(username|| email)) {
        throw new ApiError(400,"username and password is required")
    }
    // 1. find user by username or email
    const user = await User.findOne({
        $or: [{username} ,{email}] // the $or operator will find username or email   
    })
    if(!user){
        throw new ApiError(400,"User doesnot exist")
    }
    // User -> this is connect to mongoose and all the methods can be applied on User 
    const isPasswordValid = await user.isPasswordCorrect(password)


    if(!isPasswordValid){
        throw new ApiError(401,"Password is incorrect")
    }

    const {accessToken,refreshToken} = await generateAcccessAndRefreshToken(user._id);
    // here we are making another database call might be expensive side 
    const loggedInUser = await User.findById(user._id).select("-refreshToken -password")

    // to send cookies 
    const options = {
        httpOnly: true, // to prevent js access to cookie
        secure :true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User Logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    // remove cookies 
    // so we design are now cookies 
    await User.findByIdAndUpdate(
        req.user._id,
        { 
            //$set is a MongoDB operator that modifies specific fields in the document —
            //  without overwriting the entire document
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options ={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,"User loggedOut Successfully"))
    
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken =req.cookies.refreshToken ||req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorized Request");
    }
    // verify the token
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401,"Invalid refresh token ")
        }
    
        if(incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used ")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken,newRefreshToken}=await generateAcccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken",newRefreshToken)
        .json(
            new ApiResponse(
                200,
                {accessToken,newRefreshToken},
                "Access token refresed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,"Invalid refresh Token ")
    }
})


const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const{oldPassword, newPassword} =req.body;
    // if the user is logged in this implies that we have user information 
    // moreover we can say => auth middleware has  been activated 
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if(isPasswordCorrect){
        throw new ApiError(400,"Invalid old Password");
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})


const getCurrentUser= asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current User fetched Successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"Please provide all feilds")
    }


    const user = User.findByIdAndUpdate(
        req.user?._id,
        {   // set receives a objects
            $set:{
                fullName,
                email,
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully "))
})

// files update ?

const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avator is missing")
    }

    // TODO :- delete old image 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avator")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url // donot put avatar only 
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200,"avatar  is uploaded successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"cover Image  is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url // donot put avatar only 
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Cover image is uploaded successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username}=req.params
    // in mongodb '$' tell that it is a feild 
    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }
    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },{
            $lookup:{
                from:"Subscriptions", // all converted in plural and looked up from subscription model
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"Subscriptions", // all converted in plural and looked up from subscription model
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                ChannelssubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id, "$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }

        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                ChannelssubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])
})

if(!channel?.length){
    throw new ApiError(404,"channel does not excits")
}

return res
.status(200)
.json(
    new ApiResponse(200,channel[0],"User Channel fetched successfully")
)

export {
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateUserCoverImage,
    getUserChannelProfile
}