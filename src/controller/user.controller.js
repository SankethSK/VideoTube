import { asyncHandler } from "../util/asyncHandler.js"
import { apiError } from "../util/apiError.js"
import { User } from "../model/user.model.js"
import { uploadToCloud } from "../util/cloudinary.js"
import { apiResponse } from "../util/apiResponse.js"
import jwt from "jsonwebtoken"

const generateAaccessAndRefreshTokens = async function( userId ){
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken() 
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating Access and Refresh Token, try again!!!")
    }
}

const registerUser = asyncHandler(async (req, res) =>{
        
        // get user details from body
        const {fullName, email, userName, password} = req.body
        console.log(`Full Name: ${fullName}, email: ${email}, userName: ${userName}, password: ${password}`)
        
        // validation - not empty
        if([fullName, email, userName, password].some((field)=>{
            field?.trim() === ""
        })){
            throw new apiError(400, "All fields are required")
        }
        
        // check if the rec already exists: userName,email
        const existedUser = await User.findOne({
            $or: [{ userName }, { email }]
        })

        if(existedUser){
            throw new apiError(409, "User Name or email already in use")
        }

        // check for images - mandatory
        let avatarLocalPath
        let coverImageLocalPath

        if(req.files && Array.isArray(req.files.avatar)){
            avatarLocalPath = req.files.avatar[0].path
        }else{
            throw new apiError(400, "Avatar file is required")
        
        }

        if(req.files && Array.isArray(req.files.coverImage)){
            coverImageLocalPath = req.files.coverImage[0].path
        }else{
            throw new apiError(400, "Avatar file is required")
        
        }

        // upload them to cloudinary
        const avatar = await uploadToCloud(avatarLocalPath)
        const coverImage= await uploadToCloud(coverImageLocalPath)

        if(!avatar || !avatar.url){ // or use !avatar.secure_url
            throw new apiError(500, "Avatar file upload failed")
        }
     
        // create user obj - entry for db
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            userName: userName.toLowerCase()
        })

        // remove password, refreshToken from the db response
        const createdUser = await User.findById(user._id).select(
            "-password -refresToken"
        )

        // check for user creation
        if(!createdUser){
            throw new apiError(500,"Something went wrong while registering the User please try again later")
        }
        
        // return response  
        return res.status(201).json(
            new apiResponse(200, "User has been created Successfully!", createdUser)
        )
})

const loginUser = asyncHandler(async (req, res)=>{
    // req.body -> get data
    const { email, password } = req.body

    // userName/email choose one to validate
    if(!email || !password){
        throw new apiError(400, "Both email and password is nessary")
    }

    // find the User
    const user = await User.findOne({ email })
    if(!user){
        throw new apiError(404, "User does not exists")
    }
    
    // password Check
    if(!user.isPasswordCorrect(password)){
        throw new apiError(401, "Invalid user Credentials")
    }

    // access and refresh Token
    let {accessToken, refreshToken} = await generateAaccessAndRefreshTokens(user._id)

    // send cookies
    const loggedInUser = await User.findOne({ email }).select("-password -refreshToken") //coz the refered var user is no tupdate with the refreshToken 

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,"User Logged in Successfully",
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            }
        ))

})

const logoutUser = asyncHandler(async (req, res)=>{

    // Middleware verifyJWT will add the user details into the req
    await User.findByIdAndUpdate(req.user._id,{
        $set:{refreshToken: ""}
    })

    const options = {
        httpOnly: true, secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(
        200, "User Logged out!!", { }
    ))

})

const refreshAccessToken = asyncHandler(async (req, res)=>{
    const currToken = req.cookies.refreshToken || req.body.refreshToken

    if(!currToken){
        throw new apiError(401, "Unauthorized request")
    }

    try {
            const decodedToken= jwt.verify(currToken,process.env.ACCESS_TOKEN_SECRET)
            const user = await User.findById(decodedToken?._id)
        
            if(!user){
                throw new apiError(401, "Invalid refresh request")
            }
        
            if(user.refreshToken !== currToken){
                throw new apiError(401, "Refresh Token is expired")
            }
        
            const options = {
                httpOnly: true, secure: true
            }
        
            const {accessToken, refreshToken} = await generateAaccessAndRefreshTokens(user._id)
        
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new apiResponse(
                    200,"User Refresh Token refreshed Successfully",
                    {
                        user: user,
                        accessToken,
                        refreshToken
                    }
                ))
    } catch (error) {
        throw apiError(401,error?.message || "Something went wrong")   
    }
})

export {registerUser, loginUser, logoutUser, refreshAccessToken}