import express from "express";
import bp from "body-parser";
import morgan from 'morgan';
import cors from "cors";
import { connect } from "./utils/db.js";
import { register, signin, activation } from "./utils/auth.js";
import userRouter from "./resources/user/user.router.js";
import { config } from "dotenv";
config();
connect();
const app = express();
//middlewares
app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/static", express.static("public"));
//auth
app.post("/register", register);
app.get("/login", signin);
app.get("/activation/:token", activation);
app.get("/login/error", (req, res) => {
    res.send("<h1>ERROR</h1>");
});
app.get("/login/success", (req, res) => {
    res.send("<h1>SUCCESS</h1>");
});
//router
// app.use("/api",protect) //middleware
app.use("/api/user", userRouter);
//controllers
app.get("/", (req, res) => {
    res.send(`<h1>MAIN</h1>`);
});
//listen
app.listen(process.env.PORT, () => {
    console.log("listening on 8000");
});
