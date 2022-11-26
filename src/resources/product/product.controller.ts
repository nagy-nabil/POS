import { crudControllers } from '../../utils/CRUD.js'
import { Product } from "./product.model.js"
import { UserRequest } from '../../utils/types.js'
import { Response } from 'express'
import fs from "fs/promises"
import formidable from 'formidable'
import { saveAvatar } from '../../utils/general.js'
function isFieldsComplete(fields:formidable.Fields){
    if(fields.name === undefined ||fields.stock === undefined||fields.price === undefined  )
    return new Error("fields must contain name ,stock and price")
}
export async function createOne(req:UserRequest,res:Response):Promise<void|Response>{
    try{
        if(req.user === undefined) throw new Error("no user")
        //to make sure the server got public folder and don't raise error
        try{
            await fs.access("public")
            // console.log("access")
        }catch(err){
            if(err instanceof Error){
                if(err.message.includes("no such file or directory"))
                fs.mkdir("public")
            }
            else 
            throw err
        }
        const form = formidable({multiples:true,maxFileSize:50 * 1024 * 1024,
        uploadDir:"public"})//max 5mb
        form.parse(req,async(err,fields, files)=>{
            try{
                if(err){
                    throw err;
                }
                let flag = isFieldsComplete(fields)
                if(flag instanceof Error) throw flag
                let filePath:string|undefined=undefined; // undefined to not update the avatar if not supplied
                if(files.image !==undefined ){//got front image
                    const file= files.image;
                    if(typeof fields.name == "string")
                    filePath=await saveAvatar(file,fields.name);
                    if(filePath===undefined)throw new Error("files Error")
                }
                const newModel= await Product.create({...fields ,image:filePath, createdBy:req.user?._id})
                return res.status(201).json({result:"success",message:"created successfully", data:newModel})
        }catch(err){
            if(err instanceof Error){
                console.log(err.message)
                return res.status(400).json({result:"error",message:err.message})}
            else{
                return res.status(400).json({result:"error",message:err})
            }
        }})        
    }catch(err){
        if(err instanceof Error){
            console.log(err.message)
            if(err.message.includes("no such file or directory"))  return res.status(400).json({result:"error",message:"files error"})
            return res.status(400).json({result:"error",message:err.message})}
            else{
            return res.status(400).json({result:"error",message:err})
        }
    }
}
export async function updateOne(req:UserRequest,res:Response):Promise<void|Response>{
    try{
        if(req.user === undefined) throw new Error("no user")
        // console.log(req.user)
        try{
            await fs.access("public")
            console.log("access")
        }catch(err){
            if(err instanceof Error){
                if(err.message.includes("no such file or directory"))
                fs.mkdir("public")
            }
        }
        const form = formidable({multiples:true,maxFileSize:50 * 1024 * 1024,
        uploadDir:"public"})//max 5mb
        form.parse(req,async(err,fields, files)=>{
            try{
                if(err){
                    throw err;
                }
                let flag = isFieldsComplete(fields)
                if(flag instanceof Error) throw flag
                let filePath:string|undefined=undefined; // undefined to not update the avatar if not supplied
                if(files.frontimage !==undefined ){//got image
                    const file= files.frontimage;
                    console.log(fields.name , typeof fields.name)
                    if(typeof fields.name == "string")
                    filePath=await saveAvatar(file,fields.name);
                    if(filePath===undefined)throw new Error("files Error")
                }
                let updated= await Product.findByIdAndUpdate({_id:req.params.id},{...fields,image:filePath},{new:true})
                .lean()
                .exec()
                if(updated === null || updated === undefined) throw new Error("couldn't find the user [no update]")
                return res.status(201).json({result:"success",message:"updated successfully"})
            // console.log(updated)}
        }catch(err){
            if(err instanceof Error){
                console.log(err.message)
                return res.status(400).json({result:"error",message:err.message})}
            else{
                return res.status(400).json({result:"error",message:err})
            }
        }})        
    }catch(err){
        if(err instanceof Error){
            console.log(err.message)
            if(err.message.includes("no such file or directory"))  return res.status(400).json({result:"error",message:"files error"})
            return res.status(400).json({result:"error",message:err.message})}
            else{
            return res.status(400).json({result:"error",message:err})
        }
    }
}
export default crudControllers(Product)