import mongoose from 'mongoose'
import { crudControllers } from '../../utils/CRUD.js'
import { BranchDocument } from '../../utils/types.js'
import { Branch } from "./branch.model.js"
// f(Branch)
export default crudControllers(Branch)