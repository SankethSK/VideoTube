import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

const accessToken = process.env.ACCESS_TOKEN_SECRET
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY
const refreshToken = process.env.REFRESH_TOKEN_SECRET
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY
const UserSchema = new Schema({
    userName : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index:true
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        index:true
    },
    avatar: {
        type: String, //cloudinary url
        required: true,
    },
    coverImage: {
        type: String
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is Required"]
    },
    refreshToken: {
        type: String
    },
},{timestamps: true})

UserSchema.pre("save",async (next)=>{
    if(!this.isModifed("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

UserSchema.methods.isPasswordCorrect = async (password) =>{
    return await bcrypt.compare(password,this.password)
}

UserSchema.methods.generateAccessToken = () =>{
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName
        },
        accessToken,{
            expiresIn: accessTokenExpiry
        }
    )
}

UserSchema.methods.generateAccessToken = () =>{
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName
        },
        refreshToken,{
            expiresIn: refreshTokenExpiry
        }
    )
}

export const User = mongoose.model("User",UserSchema)