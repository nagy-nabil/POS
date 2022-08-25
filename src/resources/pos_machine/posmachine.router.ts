import { Router } from "express";
import controller from "./posmachine.controller.js"
const machineRouter = Router()
machineRouter.route("/").
get(controller.getMany)
.post(controller.createOne)
machineRouter.route("/:id")
.get(controller.getOne)
.put(controller.updateOne)
.delete(controller.removeOne)
export default machineRouter