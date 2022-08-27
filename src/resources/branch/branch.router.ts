import { Router} from "express";
import controller , {updateOne, createOne, getMany,getOne} from "./branch.controller.js"
const branchRouter = Router()
branchRouter.route("/")
.get(getMany)
.post(createOne)
branchRouter.route("/:id")
.get(getOne)
.put(updateOne)
.delete(controller.removeOne)
export default branchRouter