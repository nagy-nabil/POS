import { NextFunction, Request,Response } from "express";
import { User } from "./user.model.js";
import { UserRequest,FileTypeGurd } from "../../utils/types.js";
import formidable from "formidable"
import fs from "fs/promises"
export async function me(req:UserRequest,res:Response):Promise<Response>{
    if(req.user !== undefined)
    return res.status(200).json({result:"success",user:req.user})
    else 
    return res.status(500).json({result:"error",message:"no user in req body"})
}
export function updateMe(req:UserRequest,res:Response):void|Response{
    try{
        if(req.user === undefined) throw new Error("no user")
        // console.log(req.user)
        const form = formidable({multiples:true,maxFileSize:50 * 1024 * 1024,
        uploadDir:"public"})//max 5mb
        form.parse(req,async(err,fields, files)=>{
            try{
                if(err){
                    throw err;
                }
                let filePath:string|undefined=undefined; // undefined to not update the avatar if not supplied
                if(files.avatar !==undefined ){//user got avatar
                    const file= files.avatar;
                    filePath=await saveAvatar(file,req.user!.username);
                    if(filePath===undefined)throw new Error("files Error")
                }
                let updated= await User.findByIdAndUpdate({_id:req!.user!._id},{...fields,avatar:filePath},{new:true})
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
            return res.status(400).json({result:"error",message:err.message})}
        else{
            return res.status(400).json({result:"error",message:err})
        }
    }
}


async function saveAvatar(file:formidable.File|formidable.File[] , username:string):Promise<string|undefined>{
    try{
    if(FileTypeGurd(file)){
        const len = file.length;
        for(let i=1;i<len;++i){
            try{
                await fs.unlink(file[i].filepath)
            }catch(err){
                if (err instanceof Error)
                    console.log(err.message)
            }
        }
        file=file[0] //now the file always File not File[]
        
    }
    let extension!:string;
    if(file.originalFilename !== null) {
        let wordsSplit=file.originalFilename.split('.').pop()
        if(wordsSplit!==undefined){
        extension = wordsSplit}
    }else if(file.mimetype !== null){
        let wordsSplit=file.mimetype.split('/').pop()
        if(wordsSplit!==undefined){
        extension = wordsSplit}
    }else{
        extension="jpg";
    }
    if(!isFileValid(extension as string)) return undefined
    const filePath= `public/${username}.${extension}`
    await fs.rename(`${file.filepath}`,filePath)
    return filePath
    }catch(err){
        if(err instanceof Error){
            console.log(err.message)
            return undefined;
        }
        else{
            return undefined
        }
        }
}
function isFileValid (extension:string):boolean {
    interface Types {
        [k:string]:boolean
    }
    const validTypes:Types={
        "jpg":true,
        "jpeg":true,
        "png":true,
    }
    if (!validTypes[extension]) {
        return false;
    }
    return true;
};
