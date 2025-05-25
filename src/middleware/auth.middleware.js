import { apiError } from "../util/apiError.js";
import { asyncHandler } from "../util/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

const accessToken = process.env.ACCESS_TOKEN_SECRET

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") //second  part is when user uses custom headers we migh need to extract and the string "Bearer " would be added to the token as a prefix so we just replace it with empty string
        console.log("Token received:", token);
        if(!token){
            throw new apiError(401,"Unauthorized request")
        }
    
        let decodedToken = await jwt.verify(token, accessToken);
        const user= await User.findById(decodedToken._id).select("-password -refreshToken")
        
        req.user = user
        next()
    } catch (error) {
        throw new apiError(401, "Invalid Token!!!")
    }
})