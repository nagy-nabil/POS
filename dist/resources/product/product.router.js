import { Router } from "express";
import controller, { createOne, updateOne } from "./product.controller.js";
const productRouter = Router();
productRouter.route("/").
    get(controller.getMany)
    .post(createOne)
    .put(controller.updateInline);
productRouter.route("/:id")
    .get(controller.getOne)
    .put(updateOne)
    .delete(controller.removeOne);
export default productRouter;
