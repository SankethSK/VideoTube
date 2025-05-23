import dotenv from "dotenv" 
import ConnectionDB from "./db/connection.js"

dotenv.config({ path: './env' })

ConnectionDB()


// import mongoose from "mongoose"
// import {DB_NAME} from "./constants"
// import express from "express"

// const app=express()
// const mongo_uri=process.env.MONGO_URI
// const port=process.env.PORT

// ;(async ()=>{
//     try {
//         await mongoose.connect(`${mongo_uri}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("Couldnt tlk with Mongo: ",error)
//         })
//         app.listen(port,()=>{
//             console.log(`App is listenting on port: ${port}`)
//         })
//     } catch (error) {
//         console.log("ERROR: ",error)
//     }
// })()