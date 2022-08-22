import { NextFunction, Request,Response } from "express";
import { User } from "./user.model.js";
import { UserRequest } from "../../utils/types";
import formidable from "formidable"
import fs from "fs/promises"
export async function me(req:UserRequest,res:Response):Promise<Response>{
    if(req.user !== undefined)
    return res.status(200).json({result:"success",user:req.user})
    else 
    return res.status(500).json({result:"error",message:"no user in req body"})
}
export async function updateMe(req:UserRequest,res:Response):Promise<Response>{
    try{
        if(req.user === undefined) throw new Error("no user")
        // console.log(req.user)
        const form = formidable({multiples:true,maxFileSize:50 * 1024 * 1024,
        uploadDir:"public"})//max 5mb
        form.parse(req,async(err,fields, files)=>{
            if(err) return res.status(400).json({result:"error"})
            let filePath:string|undefined=undefined;
            if(files.avatar !==undefined && files.avatar instanceof formidable.PersistentFile){
                // console.log(typeof files.avatar)
                // for (let k in files.avatar)console.log(k)
                filePath= `public/${req.user?.username}.${files!.avatar?.originalFilename?.split('.').pop()}`
                await fs.rename(`${files.avatar.filepath}`,filePath)
            }
            let updated= await User.findByIdAndUpdate({_id:req!.user!._id},{...fields,avatar:filePath},{new:true})
            .lean()
            .exec()
            if(!updated) throw new Error("couldn't find the user [no update]")
            // console.log(updated)
        })
        //if the function reach here means no errors were thrown and the update done successfully
        return res.status(201).json({result:"success",message:"updated successfully"})
    }catch(err){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
        else{
            return res.status(400).json({result:"error",message:err})
        }
    }
    return res.status(500).end()
}

