import mongoose from "mongoose"
import {Request , Response} from "express"
import { UserDocument, MachineDocument, SupplierDocument, BranchDocument , FI } from "./types.js"

export const createOne =  (model:mongoose.Model<any>) => async (req:Request,res:Response)=>{
    try{
        const newModel= await model.create(req.body)
        return res.status(201).json({user:newModel})
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
            throw new Error("couldn't create new one")
        }
        return res.status(200).json({result:"success",message:"created new one successfully", data:doc})
    }catch(err){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
    }
}
export const getMany = (model:mongoose.Model<any>)=> async (req:Request,res:Response)=>{
    try{
        const docs = await model.find({})
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
        return res.status(200).json({ data: removed })
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
    createOne: createOne(model)
})