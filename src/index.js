import dotenv from "dotenv" 
import ConnectionDB from "./db/connection.js"
import { app } from "./app.js" 

dotenv.config({ path: './.env' })

let port=process.env.PORT

ConnectionDB()
.then(()=>{
    app.listen(port||8000, ()=>{
        console.log("App is listening at port: ",port)
    })
})
.catch((error)=>{
    console.log("Mongo Connection failed: ",error)
})

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