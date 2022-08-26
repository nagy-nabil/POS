import mongoose from "mongoose";
import { SupplierDocument } from "../../utils/types.js";
const SupplierSchema = new mongoose.Schema<SupplierDocument>({
    name: {type:String, required:true},
    address: {type:String},
    tel: {type:String, required:true},
    email: {type:String,required:true},
    vat: Number,
    created: { type: Date, default: Date.now },
    createdBy:{type:mongoose.Schema.Types.ObjectId}
});
SupplierSchema.index({ name: 1 }, { unique: true });
export const Supplier = mongoose.model<SupplierDocument>("supplier",SupplierSchema)