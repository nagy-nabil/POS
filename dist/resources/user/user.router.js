import { Router } from "express";
import { me, updateMe } from "./user.controller.js";
const userRouter = Router();
userRouter.route("/me")
    .get(me)
    .post(updateMe);
// .get((req, res) => {
//     res.status(200).send(`
//       <h2>With <code>"express"</code> npm package</h2>
//       <form action="/api/user/me" enctype="multipart/form-data" method="post">
//         <div>Text field title: <input type="text" name="username" /></div>
//         <div>Text field title: <input type="text" name="email" /></div>
//         <div>Text field title: <input type="text" name="first_name" /></div>
//         <div>File: <input type="file" name="avatar" multiple="multiple"  /></div>
//         <input type="submit" value="Upload" />
//       </form>
//     `);
//   })
export default userRouter;
