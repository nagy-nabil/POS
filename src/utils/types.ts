import { Request } from "express";
import mongoose from "mongoose";
import {File} from "formidable"

export interface UserDocument extends mongoose.Document {
    username:string
    email:string
    password:string
    level:string
    created:Date
    first_name:string
    last_name:string
    phone:string
    address:string
    activated_status:boolean
    activated_tokken:string
    resetPasswordToken:string
    avatar:string
}
export interface MachineDocument extends mongoose.Document {
    alias: string,
    serial_number: string,
    created: Date
    createdBy:mongoose.Types.ObjectId
}
export interface BranchDocument extends mongoose.Document {
    name: string
    address: string
    tel: string
    frontimage: string
    created: Date
    createdBy:mongoose.Types.ObjectId,
    machines:mongoose.Types.ObjectId[]
}
export interface SupplierDocument  extends mongoose.Document{
    name: string
    address: string
    tel: string
    email: string
    vat: number
    created: Date
    createdBy:mongoose.Types.ObjectId
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
export type FI = mongoose.Model<MachineDocument>|mongoose.Model<SupplierDocument>|mongoose.Model<BranchDocument>