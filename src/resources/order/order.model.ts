import mongoose from "mongoose";
import { OrderDocument } from "../../utils/types.js";
const OrderSchema = new mongoose.Schema<OrderDocument>(
    {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        total: Number,
        paid: Number,
        change: Number,
        order_list: String,
        payment_type: String,
        payment_detail: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, required: true ,ref:"user"},
        comment: String,
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);
export const Order = mongoose.model<OrderDocument>("order",OrderSchema)