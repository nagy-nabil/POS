import express from "express";
import morgan from 'morgan';
import cors from "cors";
import { connect } from "./utils/db.js";
import { register, signin, protect, activation, AskResetPassword, resetPassword } from "./utils/auth.js";
import userRouter from "./resources/user/user.router.js";
import machineRouter from "./resources/pos_machine/posmachine.router.js";
import supplierRoter from "./resources/supplier/supplier.router.js";
import branchRouter from "./resources/branch/branch.router.js";
import productRouter from "./resources/product/product.router.js";
import orderRouter from "./resources/order/order.router.js";
const app = express();
//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/static", express.static(`${process.cwd()}/public`));
app.use(express.static(`${process.cwd()}/view/css`));
app.use(express.static(`${process.cwd()}/view/js`));
app.get("/", (req, res) => {
    res.sendFile(`${process.cwd()}/view/index.html`);
});
//auth
app.post("/register", register);
app.get("/login", signin);
app.get("/activation/:token", activation);
app.route("/password/reset")
    .post(AskResetPassword)
    .put(resetPassword);
// MUST change those to redirect the request to the front end
app.get("/login/error", (req, res) => {
    res.send("<h1>ERROR</h1>");
});
app.get("/login/success", (req, res) => {
    res.send("<h1>SUCCESS</h1>");
});
//router
app.use("/api", protect); //middleware
app.use("/api/user", userRouter);
app.use("/api/machine", machineRouter);
app.use("/api/supplier", supplierRoter);
app.use("/api/branch", branchRouter);
app.use("/api/order", orderRouter);
app.use("/api/product", productRouter);
//controllers
//last middleware to catch 404 [no page]
app.use((req, res, next) => {
    console.log("404");
    res.status(404);
    return res.type('html').sendFile(`${process.cwd()}/view/404.html`);
});
//listen
connect();
app.listen(process.env.PORT, () => {
    console.log(`listen on ${process.env.PORT}`);
});
