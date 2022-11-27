import mongoose from "mongoose"
import {Request , Response} from "express"
import { UserRequest } from "./types.js"

export const createOne =  (model:mongoose.Model<any>) => async (req:UserRequest,res:Response)=>{
    try{
        const newModel= await model.create({...req.body,createdBy:req.user?._id})
        return res.status(201).json({result:"success",message:"created successfully",data:newModel})
    }catch(err:unknown){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
    }
}
export const getOne = (model:mongoose.Model<any>) => async (req:Request,res:Response)=>{
    try{
        const doc = await model.findOne({_id:req.params.id})
        .lean()
        .exec()
        if(!doc){
            throw new Error("couldn't get data")
        }
        return res.status(200).json({result:"success",message:"data has been sent successfully", data:doc})
    }catch(err){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
    }
}
export const getMany = (model:mongoose.Model<any>)=> async (_req:Request,res:Response)=>{
    try{
        const docs = await model.find({})
        .sort({created:-1})
        .lean()
        .exec()
        return res.status(200).json({result:"success", data:docs})
    }catch(err){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
    }
}

export const updateOne = (model:mongoose.Model<any>)=> async (req:Request,res:Response)=>{
    try{
        const updated = await model.findOneAndUpdate({_id:req.params.id} , req.body, {new:true})
        .lean()
        .exec()
        if(!updated){
            throw new Error("couldn't save the changes")
        }
        return res.status(200).json({result:"success",message:"data updated successfully",data:updated})
    }catch(err){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
    }
}

export const removeOne = (model:mongoose.Model<any>) => async (req:Request,res:Response)=>{
    try{
        const removed = await model.findOneAndRemove({
        _id: req.params.id
        }) 
        if (!removed) {
        throw new Error("couldn't remove")
        }
        return res.status(200).json({result:"success",message:"data remonved successfully" })
    }catch(err){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
    }
}
export const updateInline = (model:mongoose.Model<any>)=> async (req:Request,res:Response)=>{
    try{
        //column is the property name to be updated
        const id= req.body.id , column=req.body.column , value= req.body.value
        const updated = await model.findOneAndUpdate({_id:id} ,{$set:{[column]:value}}, {new:true})
        .lean()
        .exec()
        if(!updated){
            throw new Error("couldn't save the changes")
        }
        return res.status(200).json({result:"success",message:"data updated successfully",data:updated})
    }catch(err){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
    }
}
export const removeBulk = (model:mongoose.Model<any>)=> async (req:Request,res:Response)=>{
    try{
        const ids = req.body.id.split(",")
        // console.log(ids)
        const removed = await model.deleteMany({ _id: { $in: ids } })
        // console.log(removed)
        if(removed.deletedCount <= 0){
            throw new Error("couldn't save the changes")
        }
        return res.status(200).json({result:"success",message:"data removed successfully"})
    }catch(err){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
    }
}
export const crudControllers = (model:mongoose.Model<any>)=> ({
    removeOne: removeOne(model),
    updateOne: updateOne(model),
    getMany: getMany(model),
    getOne: getOne(model),
    createOne: createOne(model),
    updateInline:updateInline(model),
    removeBulk:removeBulk(model),
})