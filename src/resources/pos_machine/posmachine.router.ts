import { NextFunction, Router, Request,Response } from "express";
import controller from "./posmachine.controller.js"
const machineRouter = Router()
function isCompleteData(req:Request,res:Response,next:NextFunction){
    if(req.body.serial_number === undefined || req.body.alias === undefined)
    return res.status(400).json({result:"error", message:"request body must contain serial number and alias name"})
    next()
}
machineRouter.route("/").
get(controller.getMany)
.post(isCompleteData,controller.createOne)
machineRouter.route("/:id")
.get(controller.getOne)
.put(controller.updateOne)
.delete(controller.removeOne)
export default machineRouter