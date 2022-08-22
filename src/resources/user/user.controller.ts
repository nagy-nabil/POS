import { Request,Response } from "express";
import { UserRequest } from "../../utils/types";
export async function me(req:UserRequest,res:Response):Promise<Response>{
    if(req.user !== undefined)
    return res.status(200).json({result:"success",user:req.user})
    else 
    return res.status(500).json({result:"error",message:"no user in req body"})
}
export async function updateMe(req:Request,res:Response):Promise<Response>{
    
    return res.end()
}

