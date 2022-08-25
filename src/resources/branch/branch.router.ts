import { Router } from "express";
import controller from "./branch.controller.js"
const branchRouter = Router()
branchRouter.route("/").
get(controller.getMany)
.post(controller.createOne)
branchRouter.route("/:id")
.get(controller.getOne)
.put(controller.updateOne)
.delete(controller.removeOne)
export default branchRouter