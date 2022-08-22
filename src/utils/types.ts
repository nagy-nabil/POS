import { Request } from "express";
import {UserDocument} from  "../resources/user/user.model.js"
import mongoose from "mongoose";
export interface UserRequest extends Request {
    user?:mongoose.LeanDocument<UserDocument & { _id: mongoose.ObjectId; }>
}