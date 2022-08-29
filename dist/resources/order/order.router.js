import { Router } from "express";
import controller, { createOne } from "./order.controller.js";
const orderRouter = Router();
orderRouter.route("/").
    get(controller.getMany)
    .post(createOne);
orderRouter.route("/:id")
    .get(controller.getOne)
    .put(controller.updateOne)
    .delete(controller.removeOne);
export default orderRouter;
