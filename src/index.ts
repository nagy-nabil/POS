import exprees, {Request,Response} from "express"
import bp from "body-parser"
import morgan from 'morgan'
import cors from "cors"
import {connect} from "./utils/db.js"
import {register,signin,protect} from  "./utils/auth.js"
import userRouter from "./resources/user/user.router.js"
connect()
const app = exprees();

//middlewares
app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({extended:true}));
app.use(morgan("dev"))
//auth
app.post("/register",register)
app.get("/login",signin)
//router
app.use("/api",protect) //middleware
app.use("/api/user",userRouter)
//controllers

//listen
app.listen(8000,()=>{
    console.log("listening on 8000")
})