import { Router } from "express";
import {me,updateMe} from "./user.controller.js"
const userRouter= Router();
userRouter.route("/me")
.get(me)
.put(updateMe);
export default userRouter;