import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"
import express from "express"

const mongo_uri=process.env.MONGO_URI

const ConnectionDB = async () =>{
    try {
        const ConnectionInstance=await mongoose.connect(`${mongo_uri}/${DB_NAME}`)
        console.log("Connection Established for DB: ",ConnectionInstance.connection.host)
    } catch (error) {
        console.log(`ERROR WHILE CONNECTING DB: ${DB_NAME} :`,error)
        process.exit(1)
    }
}

export default ConnectionDB