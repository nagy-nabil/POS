import { Router, Request,Response,NextFunction } from "express";
import controller , {updateOne, createOne} from "./branch.controller.js"
const branchRouter = Router()
branchRouter.route("/").
get(controller.getMany)
.post(createOne)
branchRouter.route("/:id")
.get(controller.getOne)
.put(updateOne)
.delete(controller.removeOne)
export default branchRouter