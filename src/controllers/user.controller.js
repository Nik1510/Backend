import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

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
        throw new ApiError(400,"usernama and password is required")
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
    .clearCoolie("accessToken",options)
    .clearCoolie("refreshToken",options)
    .json(new ApiResponse(200,"User loggedOut Successfully"))
    
})



export {
    registerUser, 
    loginUser,
    logoutUser
}