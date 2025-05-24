import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
let origin = process.env.CORS_ORIGIN

app.use(cors({
    origin: origin,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public")) 
app.use(cookieParser())

// import userRouter
import userRrouter from "./routes/user.routes.js"

app.use("/api/v1/users",userRrouter)

export {app}