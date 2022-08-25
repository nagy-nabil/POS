import mongoose from "mongoose";
import { BranchDocument } from "../../utils/types.js";
const BranchSchema = new mongoose.Schema<BranchDocument>({
    name: {type:String,required:true},
    address: String,
    tel: {type:String,required:true},
    frontimage: {type:String , default:""},
    created: { type: Date, default: Date.now },
});
BranchSchema.index({ name: 1 }, { unique: true });
export const Branch = mongoose.model<BranchDocument>("branch",BranchSchema)