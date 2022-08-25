import mongoose from "mongoose";
import { SupplierDocument } from "../../utils/types.js";
const SupplierSchema = new mongoose.Schema({
    name: {type:String, required:true},
    address: {type:String,default:""},
    tel: String,
    email: {type:String,required:true},
    vat: Number,
    created: { type: Date, default: Date.now },
});
SupplierSchema.index({ name: 1 }, { unique: true });
export const Supplier = mongoose.model<SupplierDocument>("supplier",SupplierSchema)