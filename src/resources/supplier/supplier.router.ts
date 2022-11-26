import { Router ,Request,Response,NextFunction} from "express";
import controller from "./supplier.controller.js"
const supplierRouter = Router()
function isCompleteData(req:Request,res:Response,next:NextFunction){
    if(req.body.name === undefined || req.body.tel === undefined || req.body.email === undefined)
    return res.status(400).json({result:"error", message:"request body must contain name , email and tel"})
    next()
}
supplierRouter.route("/").
get(controller.getMany)
.post(isCompleteData,controller.createOne)
supplierRouter.route("/:id")
.get(controller.getOne)
.put(controller.updateOne)
.delete(controller.removeOne)
export default supplierRouter