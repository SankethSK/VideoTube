import { asyncHandler } from "../util/asyncHandler.js"
import { apiError } from "../util/apiError.js"
import { User } from "../model/user.model.js"
import { uploadToCloud } from "../util/cloudinary.js"
import { apiResponse } from "../util/apiResponse.js"


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
        const existedUser = User.findOne({
            $or: [{ userName }, { email }]
        })

        if(existedUser){
            throw new apiError(409, "User Name or email already in use")
        }

        // check for images - mandatory

        const avatarLocalPath = req.files?.avatar[0]?.path
        const coverImageLocalPath = req.files?.coverImage[0]?.path

        if(!avatarLocalPath){
            throw new apiError(400, "Avatar file is required")
        }

        // upload them to cloudinary
        const avatar = await uploadToCloud(avatarLocalPath)
        const coverImage= await uploadToCloud(coverImageLocalPath)

        if(!avatar){
            throw new apiError(400, "Avatar file upload failed")
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

export {registerUser}