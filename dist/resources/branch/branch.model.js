import mongoose from "mongoose";
const BranchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: String,
    tel: { type: String, required: true },
    frontimage: { type: String },
    created: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    machines: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'machine' }
    ],
});
BranchSchema.index({ name: 1 }, { unique: true });
export const Branch = mongoose.model("branch", BranchSchema);
