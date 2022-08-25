import { Router } from "express";
import controller from "./supplier.controller.js"
const supplierRouter = Router()
supplierRouter.route("/").
get(controller.getMany)
.post(controller.createOne)
supplierRouter.route("/:id")
.get(controller.getOne)
.put(controller.updateOne)
.delete(controller.removeOne)
export default supplierRouter