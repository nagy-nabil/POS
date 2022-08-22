import mongoose from "mongoose"
import {Request , Response} from "express"
import {UserDocument} from "../resources/user/user.model"

export const createOne =  (model:mongoose.Model<UserDocument>) => async (req:Request,res:Response)=>{
    try{

    const newModel= await model.create(...req.body)
    res.status(201).json({user:newModel})
    }catch(err:unknown){
        if(err instanceof Error)
        res.status(400).json({message:err.message})
    }
}

