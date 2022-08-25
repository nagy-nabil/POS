import mongoose from 'mongoose'
import { crudControllers } from '../../utils/CRUD.js'
import { BranchDocument } from '../../utils/types.js'
import { Branch } from "./branch.model.js"
function f (itm:any):asserts itm is mongoose.Model<BranchDocument>{
    if(!itm) throw new Error("Fg")
}
f(Branch)
export default crudControllers(Branch)