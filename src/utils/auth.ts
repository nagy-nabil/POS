import {NextFunction, Request,Response} from "express"
import {User,UserDocument} from "../resources/user/user.model.js"
import jwt from "jsonwebtoken"
import config from "../config/main.js"
import mongoose, { model, ObjectId } from "mongoose"
import {UserRequest} from "./types.js"
/**
 * create tokken , send it to the user [payload is the user id]
 * user concern to save the tokken [the front end will save it in the local storage]
 * verify the tokken 
 * search for user with the tokken 
 * check email password [if needed with sign in ]
 * protect assign the user to the req[middleware]
 */

export const newToken = (user:UserDocument) => {
    return jwt.sign({ id: user._id,level:user.level }, config.jwt.secret, {
        expiresIn: config.jwt.expiresin
    })
}
export const verifyToken = (token:string) =>
    new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, payload) => {
        if (err) return reject(err)
        resolve(payload)
    })
})

//controller for sign up
export async function register(req:Request,res:Response):Promise<Response>{
    try{
        if(!req.body.username || !req.body.email || !req.body.password )
        return res.status(400).json({result:"error",message:"required username, email and password"})
        const model:UserDocument=await User.create(req.body)
        const tokken= newToken(model)
        return res.status(201).json({result:"success",message:"registred successfully", tokken:tokken})
    }catch(err){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
    }
    return res.end()
}
//sign in with username password
export async function signin (req:Request, res:Response):Promise<Response>{
    try{
        if(!req.body.username  || !req.body.password )
            return res.status(400).json({result:"error",message:"required username and password"})
            const user = await User.findOne({ username: req.body.username })
            .select('username password')
            .exec()
        if (!user) {
            return res.status(401).json({result:"error",message:"no such user"})
        }
        if(! (req.body.password === user.password))
            return res.status(401).json({result:"error",message:"wrong username or password"})
        else{
            const tokken= newToken(user)
            return res.status(200).json({result:"success",message:"singin successfully", tokken:tokken})}
    }catch(err){
        if(err instanceof Error)
        return res.status(400).json({result:"error",message:err.message})
    }
    return res.end()
}
//typegurd
interface Payload {
    id:string;
    level :string;
}
function isPayload(payload:any): payload is Payload{
    if(payload.id !== undefined && payload.level !== undefined)
    return true;
    else return true
}
//middleware
export const protect = async (req:UserRequest, res:Response, next:NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer || !bearer.startsWith('Bearer ')) {
        return res.status(401).json({result:"error",message:"bad tokken"})
    }
    const token = bearer.split('Bearer ')[1].trim()
    let payload
    try {
        payload = await verifyToken(token)
    } catch (e) {
        return res.status(401).json({result:"error",message:"bad tokken"})
    }
    // console.log(payload)
    //if we reach here means the tokken didn't throw
    if(isPayload(payload)){
    const user= await User.findById(payload.id)
        .select('-password')
        .lean()
        .exec()
        if (!user) {
            return res.status(401).end()
        }
        // console.log(user)?
        req.user = user
    }
    else{
        // console.log("what")
    }
    
    next()
}