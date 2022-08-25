import express, {Request,Response} from "express"
import bp from "body-parser"
import morgan from 'morgan'
import cors from "cors"
import {connect} from "./utils/db.js"
import {register,signin,protect,activation,AskResetPassword,resetPassword} from  "./utils/auth.js"
import userRouter from "./resources/user/user.router.js"
const app = express();
//middlewares
app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({extended:true}));
app.use(morgan("dev"))
app.use("/static",express.static("public"))
//auth
app.post("/register",register)
app.get("/login",signin)
app.get("/activation/:token",activation)
app.route("/password/reset")
.post(AskResetPassword)
.put(resetPassword)
// MUST change those to redirect the request to the front end
app.get("/login/error",(req,res)=>{
    res.send("<h1>ERROR</h1>")
})
app.get("/login/success",(req,res)=>{
    res.send("<h1>SUCCESS</h1>")
})
//router
app.use("/api",protect) //middleware
app.use("/api/user",userRouter)
//controllers
//last middleware to catch 404 [no page]
app.use((req,res,next)=>{
    console.log("404")
    res.status(404)
    return res.type('html').send('<h1>404 NOT FOUND</h1>');
})
//listen
connect()
app.listen(process.env.PORT,()=>{
    console.log(`listen on ${process.env.PORT}`)
})