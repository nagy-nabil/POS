import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    stock: { type: Number, requreid: true },
    price: { type: Number, requreid: true },
    image: String,
    created: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "user" }
});
ProductSchema.index({ name: 1 }, { unique: true });
export const Product = mongoose.model("product", ProductSchema);
