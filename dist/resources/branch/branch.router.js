import { Router } from "express";
import controller, { updateOne, createOne, getMany, getOne } from "./branch.controller.js";
const branchRouter = Router();
//middleware to make sure we got id , column and value
function isFieldsComplete(req, res, next) {
    if (req.body.id === undefined || req.body.column === undefined || req.body.value === undefined)
        return res.status(400).json({
            result: "error",
            message: "uncomplete body, body must contain id colmun and value"
        });
    next();
}
branchRouter.route("/")
    .get(getMany)
    .post(createOne)
    .put(isFieldsComplete, controller.updateInline)
    .delete(controller.removeBulk);
branchRouter.route("/:id")
    .get(getOne)
    .put(updateOne)
    .delete(controller.removeOne);
export default branchRouter;
