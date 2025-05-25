import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controller/user.controller.js";
import upload from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const userRrouter = Router();

userRrouter.route("/register").post(
    upload.fields([
        {
            name: "avatar", maxCount: 1
        },{
            name: "coverImage", maxCount: 1
        }
    ]),    
    registerUser);

userRrouter.route("/login").post(loginUser)

// Secured Routes
userRrouter.route("/logout").post(verifyJWT, logoutUser) //verifyJWT adds a middleware

userRrouter.route("/refreshToken").post(refreshAccessToken)

export default userRrouter;