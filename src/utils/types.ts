import e, { Request } from "express";
import mongoose from "mongoose";
import {File} from "formidable"
export interface UserDocument extends mongoose.Document {
    username:string
    email:String
    password:string
    level:string
    created:Date
    first_name:string
    last_name:string
    phone:string
    address:string
    activated_status:boolean
    activated_tokken:string
}
export interface UserRequest extends Request {
    user?:mongoose.LeanDocument<UserDocument & { _id: mongoose.ObjectId; }>
}
//gurd to know if the file is File[]
export function FileTypeGurd(file:any):file is File[]{
    if(file.length !== undefined)
        return true
    else return false
}